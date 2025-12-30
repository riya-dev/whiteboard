"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { LogOut, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface DailyGoal {
  id: string
  goal_text: string
  is_completed: boolean
  goal_order: number
  goal_date: string
}

interface Discipline {
  id: string
  discipline_name: string
  color: string
}

interface DisciplineTracking {
  discipline_id: string
  track_date: string
  is_completed: boolean
}

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()))

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState<Record<string, DailyGoal[]>>({})
  const [newGoals, setNewGoals] = useState<Record<string, string[]>>({})

  // Disciplines state
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [newDisciplineName, setNewDisciplineName] = useState("")
  const [showAddDiscipline, setShowAddDiscipline] = useState(false)
  const [tracking, setTracking] = useState<DisciplineTracking[]>([])

  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  function getWeekDates(): Date[] {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  function getLast90Days(): string[] {
    const dates: string[] = []
    const today = new Date()
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(formatDate(date))
    }
    return dates
  }

  useEffect(() => {
    loadData()
  }, [currentWeekStart])

  async function loadData() {
    setLoading(true)
    const weekDates = getWeekDates().map(formatDate)

    // Load daily goals
    const { data: goalsData } = await supabase
      .from("daily_goals")
      .select("*")
      .in("goal_date", weekDates)
      .order("goal_order")

    const goalsByDate: Record<string, DailyGoal[]> = {}
    weekDates.forEach((date) => {
      goalsByDate[date] = goalsData?.filter((g) => g.goal_date === date) || []
    })
    setDailyGoals(goalsByDate)

    // Initialize new goals state
    const newGoalsState: Record<string, string[]> = {}
    weekDates.forEach((date) => {
      const existingCount = goalsByDate[date].length
      newGoalsState[date] = Array(3 - existingCount).fill("")
    })
    setNewGoals(newGoalsState)

    // Load disciplines
    const { data: disciplinesData } = await supabase.from("disciplines").select("*").order("created_at")

    setDisciplines(disciplinesData || [])

    // Load tracking data
    const last90Days = getLast90Days()
    const { data: trackingData } = await supabase.from("discipline_tracking").select("*").in("track_date", last90Days)

    setTracking(trackingData || [])

    setLoading(false)
  }

  async function handleAddGoal(date: string, goalText: string, goalOrder: number) {
    if (!goalText.trim()) return

    const { data, error } = await supabase
      .from("daily_goals")
      .insert({
        user_id: user.id,
        goal_date: date,
        goal_text: goalText,
        goal_order: goalOrder,
      })
      .select()
      .single()

    if (!error && data) {
      setDailyGoals((prev) => ({
        ...prev,
        [date]: [...(prev[date] || []), data],
      }))
      setNewGoals((prev) => ({
        ...prev,
        [date]: prev[date].filter((_, i) => i !== goalOrder - dailyGoals[date].length - 1),
      }))
    }
  }

  async function handleToggleGoal(goal: DailyGoal) {
    const { error } = await supabase.from("daily_goals").update({ is_completed: !goal.is_completed }).eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goal.goal_date]: prev[goal.goal_date].map((g) =>
          g.id === goal.id ? { ...g, is_completed: !g.is_completed } : g,
        ),
      }))
    }
  }

  async function handleDeleteGoal(goal: DailyGoal) {
    const { error } = await supabase.from("daily_goals").delete().eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goal.goal_date]: prev[goal.goal_date].filter((g) => g.id !== goal.id),
      }))
    }
  }

  async function handleAddDiscipline() {
    if (!newDisciplineName.trim()) return

    const colors = ["#ffc0cb", "#ffd4de", "#f4aebd", "#ffb6c1", "#ffa6c1"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const { data, error } = await supabase
      .from("disciplines")
      .insert({
        user_id: user.id,
        discipline_name: newDisciplineName,
        color: randomColor,
      })
      .select()
      .single()

    if (!error && data) {
      setDisciplines((prev) => [...prev, data])
      setNewDisciplineName("")
      setShowAddDiscipline(false)
    }
  }

  async function handleToggleTracking(disciplineId: string, date: string) {
    const existing = tracking.find((t) => t.discipline_id === disciplineId && t.track_date === date)

    if (existing) {
      const { error } = await supabase
        .from("discipline_tracking")
        .delete()
        .eq("discipline_id", disciplineId)
        .eq("track_date", date)

      if (!error) {
        setTracking((prev) => prev.filter((t) => !(t.discipline_id === disciplineId && t.track_date === date)))
      }
    } else {
      const { data, error } = await supabase
        .from("discipline_tracking")
        .insert({
          user_id: user.id,
          discipline_id: disciplineId,
          track_date: date,
          is_completed: true,
        })
        .select()
        .single()

      if (!error && data) {
        setTracking((prev) => [...prev, data])
      }
    }
  }

  function isTracked(disciplineId: string, date: string): boolean {
    return tracking.some((t) => t.discipline_id === disciplineId && t.track_date === date)
  }

  function getWeekday(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  function getDateNum(date: Date): string {
    return date.getDate().toString()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading your planner...</div>
      </div>
    )
  }

  const weekDates = getWeekDates()
  const last90Days = getLast90Days()

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-1">Your Week</h1>
          <p className="text-sm text-muted-foreground">
            {currentWeekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            {" - "}
            {weekDates[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentWeekStart(getWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)))
            }
            className="border-border"
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
            className="border-border"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentWeekStart(getWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)))
            }
            className="border-border"
          >
            →
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-4">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Weekly Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date, idx) => {
            const dateStr = formatDate(date)
            const goals = dailyGoals[dateStr] || []
            const newGoalInputs = newGoals[dateStr] || []
            const isToday = formatDate(new Date()) === dateStr

            return (
              <Card
                key={dateStr}
                className={`p-4 border transition-all ${
                  isToday ? "border-primary bg-accent/20" : "border-border bg-card"
                }`}
              >
                <div className="mb-4 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{getWeekday(date)}</div>
                  <div className={`text-2xl font-light ${isToday ? "text-primary" : "text-foreground"}`}>
                    {getDateNum(date)}
                  </div>
                </div>

                <div className="space-y-2">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-start gap-2 group">
                      <Checkbox
                        checked={goal.is_completed}
                        onCheckedChange={() => handleToggleGoal(goal)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-relaxed break-words ${
                            goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {goal.goal_text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {newGoalInputs.map((goalText, idx) => (
                    <Input
                      key={idx}
                      value={goalText}
                      onChange={(e) => {
                        setNewGoals((prev) => ({
                          ...prev,
                          [dateStr]: prev[dateStr].map((g, i) => (i === idx ? e.target.value : g)),
                        }))
                      }}
                      onBlur={() => {
                        if (goalText.trim()) {
                          handleAddGoal(dateStr, goalText, goals.length + idx + 1)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur()
                        }
                      }}
                      placeholder={`Goal ${goals.length + idx + 1}`}
                      className="text-sm bg-background border-border"
                    />
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Discipline Trackers */}
        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-foreground">Discipline Trackers</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDiscipline(!showAddDiscipline)}
              className="border-border"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tracker
            </Button>
          </div>

          {showAddDiscipline && (
            <div className="mb-6 flex gap-2">
              <Input
                value={newDisciplineName}
                onChange={(e) => setNewDisciplineName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddDiscipline()
                  }
                }}
                placeholder="Discipline name (e.g., Gym, Read, Meditate)"
                className="bg-background border-border"
              />
              <Button onClick={handleAddDiscipline} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add
              </Button>
            </div>
          )}

          <div className="space-y-6">
            {disciplines.map((discipline) => (
              <div key={discipline.id}>
                <h3 className="text-sm font-medium text-foreground mb-3">{discipline.discipline_name}</h3>
                <div className="flex gap-1 flex-wrap">
                  {last90Days.map((date) => {
                    const tracked = isTracked(discipline.id, date)
                    return (
                      <button
                        key={date}
                        onClick={() => handleToggleTracking(discipline.id, date)}
                        className={`w-3 h-3 rounded-sm border transition-all ${
                          tracked ? "border-primary" : "bg-muted border-border hover:border-primary/50"
                        }`}
                        style={{
                          backgroundColor: tracked ? discipline.color : undefined,
                        }}
                        title={date}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            {disciplines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Add a discipline tracker to start building consistency
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
