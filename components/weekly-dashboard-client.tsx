"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { getTuesdayWeekStart, getTuesdayWeekDates, formatDate, getLast365Days } from "@/lib/date-utils"
import type { DailyGoalData, DisciplineTrackingData } from "@/lib/completion-utils"

// Components
import { DashboardHeader } from "./weekly-dashboard/header"
import { SidebarWeekly } from "./weekly-dashboard/sidebar-weekly"
import { MobileSidebar } from "./weekly-dashboard/mobile-sidebar"
import { WeeklyGoalsCard } from "./weekly-dashboard/weekly-goals-card"
import { DailyGrid } from "./weekly-dashboard/daily-grid"
import { DisciplineCard } from "./weekly-dashboard/discipline-card"
import { GoalsHeatmap } from "./weekly-dashboard/heatmap-goals"
import { DisciplineHeatmap } from "./weekly-dashboard/heatmap-discipline"
import { Card } from "./ui/card"

// ===== TYPE DEFINITIONS =====

interface DailyGoal {
  id: string
  user_id: string
  goal_date: string
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface WeeklyGoal {
  id: string
  user_id: string
  period_start_date: string
  cadence: "weekly" | "biweekly"
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface Lookahead {
  id?: string
  user_id?: string
  week_start_date: string
  this_week_text: string
  next_week_text: string
  learnings_text: string
}

interface DisciplineTracking {
  id?: string
  user_id?: string
  track_date: string
  am_checkin: boolean
  pm_checkin: boolean
  set_goals_tomorrow: boolean
}

// ===== MAIN COMPONENT =====

export default function WeeklyDashboardClient({ user }: { user: User }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getTuesdayWeekStart(new Date()))

  // State
  const [dailyGoals, setDailyGoals] = useState<Record<string, DailyGoal[]>>({})
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([])
  const [weeklyGoalsCadence, setWeeklyGoalsCadence] = useState<"weekly" | "biweekly">("weekly")
  const [lookahead, setLookahead] = useState<Lookahead>({
    week_start_date: formatDate(currentWeekStart),
    this_week_text: "",
    next_week_text: "",
    learnings_text: "",
  })
  const [disciplineTracking, setDisciplineTracking] = useState<DisciplineTracking[]>([])

  // Heatmap data (365 days)
  const [allDailyGoals, setAllDailyGoals] = useState<DailyGoalData[]>([])
  const [allDisciplineTracking, setAllDisciplineTracking] = useState<DisciplineTrackingData[]>([])

  // ===== DATA LOADING =====

  useEffect(() => {
    loadData()
  }, [currentWeekStart])

  async function loadData() {
    setLoading(true)
    const weekDates = getTuesdayWeekDates(currentWeekStart)
    const weekDateStrs = weekDates.map(formatDate)
    const weekStartStr = formatDate(currentWeekStart)

    // Load daily goals for this week
    const { data: dailyGoalsData } = await supabase
      .from("daily_goals")
      .select("*")
      .in("goal_date", weekDateStrs)
      .order("goal_order")

    const goalsByDate: Record<string, DailyGoal[]> = {}
    weekDateStrs.forEach((date) => {
      goalsByDate[date] = dailyGoalsData?.filter((g) => g.goal_date === date) || []
    })
    setDailyGoals(goalsByDate)

    // Load weekly goals for this period
    const { data: weeklyGoalsData } = await supabase
      .from("weekly_goals")
      .select("*")
      .eq("period_start_date", weekStartStr)
      .order("goal_order")

    setWeeklyGoals(weeklyGoalsData || [])
    if (weeklyGoalsData && weeklyGoalsData.length > 0) {
      setWeeklyGoalsCadence(weeklyGoalsData[0].cadence)
    }

    // Load lookahead for this week
    const { data: lookaheadData } = await supabase
      .from("lookahead")
      .select("*")
      .eq("week_start_date", weekStartStr)
      .maybeSingle()

    if (lookaheadData) {
      setLookahead(lookaheadData)
    } else {
      setLookahead({
        week_start_date: weekStartStr,
        this_week_text: "",
        next_week_text: "",
        learnings_text: "",
      })
    }

    // Load discipline tracking for this week
    const { data: disciplineData } = await supabase
      .from("discipline_tracking")
      .select("*")
      .in("track_date", weekDateStrs)

    setDisciplineTracking(disciplineData || [])

    // Load all data for heatmaps (365 days)
    const last365Days = getLast365Days()

    const { data: allGoalsData } = await supabase
      .from("daily_goals")
      .select("goal_date, is_completed")
      .in("goal_date", last365Days)

    setAllDailyGoals(allGoalsData || [])

    const { data: allDisciplineData } = await supabase
      .from("discipline_tracking")
      .select("track_date, am_checkin, pm_checkin, set_goals_tomorrow")
      .in("track_date", last365Days)

    setAllDisciplineTracking(allDisciplineData || [])

    setLoading(false)
  }

  // ===== DAILY GOALS HANDLERS =====

  async function handleToggleDailyGoal(goal: DailyGoal) {
    const { error } = await supabase
      .from("daily_goals")
      .update({ is_completed: !goal.is_completed })
      .eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goal.goal_date]: prev[goal.goal_date].map((g) =>
          g.id === goal.id ? { ...g, is_completed: !g.is_completed } : g
        ),
      }))
      // Refresh heatmap data
      loadData()
    }
  }

  async function handleAddDailyGoal(dateStr: string, goalText: string) {
    if (!goalText.trim()) return

    const existingGoals = dailyGoals[dateStr] || []
    const goalOrder = existingGoals.length + 1

    const { data, error } = await supabase
      .from("daily_goals")
      .insert({
        user_id: user.id,
        goal_date: dateStr,
        goal_text: goalText,
        goal_order: goalOrder,
        is_completed: false,
      })
      .select()
      .single()

    if (!error && data) {
      setDailyGoals((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data],
      }))
    }
  }

  async function handleDeleteDailyGoal(goal: DailyGoal) {
    const { error } = await supabase.from("daily_goals").delete().eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goal.goal_date]: prev[goal.goal_date].filter((g) => g.id !== goal.id),
      }))
      // Refresh heatmap data
      loadData()
    }
  }

  // ===== WEEKLY GOALS HANDLERS =====

  async function handleToggleWeeklyGoal(goal: WeeklyGoal) {
    const { error } = await supabase
      .from("weekly_goals")
      .update({ is_completed: !goal.is_completed })
      .eq("id", goal.id)

    if (!error) {
      setWeeklyGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, is_completed: !g.is_completed } : g))
      )
    }
  }

  async function handleAddWeeklyGoal(goalText: string, cadence: "weekly" | "biweekly") {
    if (!goalText.trim()) return

    const goalOrder = weeklyGoals.length + 1
    const weekStartStr = formatDate(currentWeekStart)

    const { data, error } = await supabase
      .from("weekly_goals")
      .insert({
        user_id: user.id,
        period_start_date: weekStartStr,
        cadence,
        goal_text: goalText,
        goal_order: goalOrder,
        is_completed: false,
      })
      .select()
      .single()

    if (!error && data) {
      setWeeklyGoals((prev) => [...prev, data])
    }
  }

  async function handleDeleteWeeklyGoal(goal: WeeklyGoal) {
    const { error } = await supabase.from("weekly_goals").delete().eq("id", goal.id)

    if (!error) {
      setWeeklyGoals((prev) => prev.filter((g) => g.id !== goal.id))
    }
  }

  async function handleCadenceChange(cadence: "weekly" | "biweekly") {
    setWeeklyGoalsCadence(cadence)
    // Update all weekly goals for this period to new cadence
    const weekStartStr = formatDate(currentWeekStart)
    await supabase
      .from("weekly_goals")
      .update({ cadence })
      .eq("period_start_date", weekStartStr)

    setWeeklyGoals((prev) => prev.map((g) => ({ ...g, cadence })))
  }

  // ===== LOOKAHEAD HANDLERS =====

  async function handleUpdateLookahead(
    field: keyof Lookahead,
    value: string
  ) {
    const weekStartStr = formatDate(currentWeekStart)

    const updatedLookahead = { ...lookahead, [field]: value }
    setLookahead(updatedLookahead)

    // Upsert to database (debounced in production, but immediate here for simplicity)
    const { data: existing } = await supabase
      .from("lookahead")
      .select("id")
      .eq("week_start_date", weekStartStr)
      .maybeSingle()

    if (existing) {
      await supabase.from("lookahead").update({ [field]: value }).eq("id", existing.id)
    } else {
      await supabase.from("lookahead").insert({
        user_id: user.id,
        week_start_date: weekStartStr,
        [field]: value,
      })
    }
  }

  // ===== DISCIPLINE HANDLERS =====

  async function handleToggleDiscipline(
    dateStr: string,
    field: "am_checkin" | "pm_checkin" | "set_goals_tomorrow"
  ) {
    const existing = disciplineTracking.find((t) => t.track_date === dateStr)

    if (existing) {
      const newValue = !existing[field]
      await supabase
        .from("discipline_tracking")
        .update({ [field]: newValue })
        .eq("track_date", dateStr)
        .eq("user_id", user.id)

      setDisciplineTracking((prev) =>
        prev.map((t) => (t.track_date === dateStr ? { ...t, [field]: newValue } : t))
      )
    } else {
      const { data, error } = await supabase
        .from("discipline_tracking")
        .insert({
          user_id: user.id,
          track_date: dateStr,
          am_checkin: field === "am_checkin",
          pm_checkin: field === "pm_checkin",
          set_goals_tomorrow: field === "set_goals_tomorrow",
        })
        .select()
        .single()

      if (!error && data) {
        setDisciplineTracking((prev) => [...prev, data])
      }
    }

    // Refresh heatmap data
    loadData()
  }

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading your planner...</div>
      </div>
    )
  }

  const weekDates = getTuesdayWeekDates(currentWeekStart)

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader weekStart={currentWeekStart} onWeekChange={setCurrentWeekStart} />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <SidebarWeekly lookahead={lookahead} onUpdateLookahead={handleUpdateLookahead} />
          </div>

          {/* Mobile Sidebar */}
          <div className="lg:hidden col-span-1">
            <MobileSidebar lookahead={lookahead} onUpdateLookahead={handleUpdateLookahead} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Weekly Goals */}
            <WeeklyGoalsCard
              goals={weeklyGoals}
              cadence={weeklyGoalsCadence}
              onCadenceChange={handleCadenceChange}
              onToggleGoal={handleToggleWeeklyGoal}
              onAddGoal={handleAddWeeklyGoal}
              onDeleteGoal={handleDeleteWeeklyGoal}
            />

            {/* Daily Grid */}
            <DailyGrid
              weekDates={weekDates}
              dailyGoals={dailyGoals}
              onToggleGoal={handleToggleDailyGoal}
              onAddGoal={handleAddDailyGoal}
              onDeleteGoal={handleDeleteDailyGoal}
            />

            {/* Discipline */}
            <DisciplineCard
              weekDates={weekDates}
              tracking={disciplineTracking}
              onToggle={handleToggleDiscipline}
            />

            {/* Heatmaps */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <GoalsHeatmap goals={allDailyGoals} />
              </Card>
              <Card className="p-6">
                <DisciplineHeatmap tracking={allDisciplineTracking} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
