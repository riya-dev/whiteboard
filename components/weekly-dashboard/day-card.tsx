"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Calendar, X } from "lucide-react"
import { getDayName, getDayNumber, isToday } from "@/lib/date-utils"

interface DailyGoal {
  id: string
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface DayCardProps {
  date: Date
  dateStr: string
  goals: DailyGoal[]
  onToggleGoal: (goal: DailyGoal) => void
  onAddGoal: (goalText: string) => void
  onUpdateGoal: (goalId: string, goalText: string) => void
  onDeleteGoal: (goal: DailyGoal) => void
}

export function DayCard({ date, dateStr, goals, onToggleGoal, onAddGoal, onUpdateGoal, onDeleteGoal }: DayCardProps) {
  const [newGoalText, setNewGoalText] = useState("")
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editGoalText, setEditGoalText] = useState("")
  const [booster, setBooster] = useState(false)
  const [xr, setXr] = useState(false)
  const [pills, setPills] = useState(false)
  const today = isToday(date)
  const dayName = getDayName(date)
  const dayNum = getDayNumber(date)

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText)
      setNewGoalText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddGoal()
    }
  }

  const startEdit = (goalId: string, currentText: string) => {
    setEditingGoalId(goalId)
    setEditGoalText(currentText)
  }

  const saveEdit = () => {
    if (editingGoalId && editGoalText.trim()) {
      onUpdateGoal(editingGoalId, editGoalText.trim())
    }
    setEditingGoalId(null)
    setEditGoalText("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit()
    } else if (e.key === "Escape") {
      setEditingGoalId(null)
      setEditGoalText("")
    }
  }

  // Persist booster/xr/pills flags per day using localStorage
  function loadFlags() {
    try {
      const raw = localStorage.getItem(`daily_flags_${dateStr}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        setBooster(!!parsed.booster)
        setXr(!!parsed.xr)
        setPills(!!parsed.pills)
      } else {
        setBooster(false)
        setXr(false)
        setPills(false)
      }
    } catch {
      // ignore
    }
  }

  function saveFlags(next: { booster?: boolean; xr?: boolean; pills?: boolean }) {
    try {
      const current = { booster, xr, pills }
      const merged = { ...current, ...next }
      localStorage.setItem(`daily_flags_${dateStr}`, JSON.stringify(merged))
      setBooster(!!merged.booster)
      setXr(!!merged.xr)
      setPills(!!merged.pills)
    } catch {
      // ignore
    }
  }

  // Load flags when date changes
  useEffect(() => {
    loadFlags()
  }, [dateStr])

  return (
    <Card
      className={`relative p-5 transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/5 hover:shadow-md hover:border-border`}
    >
      {/* Top-right quick flags */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {/* Booster button (circle) */}
        <button
          type="button"
          onClick={() => saveFlags({ booster: !booster })}
          className={`h-7 w-7 inline-flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
            booster
              ? "border-primary bg-primary/15"
              : "border-border bg-background/60 hover:bg-accent/30"
          }`}
          aria-pressed={booster}
          aria-label="Toggle booster"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            className={booster ? "text-primary" : "text-muted-foreground"}
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
        </button>
        {/* XR button (pill shape) */}
        <button
          type="button"
          onClick={() => saveFlags({ xr: !xr })}
          className={`h-7 w-7 inline-flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
            xr
              ? "border-primary bg-primary/15"
              : "border-border bg-background/60 hover:bg-accent/30"
          }`}
          aria-pressed={xr}
          aria-label="Toggle XR"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            className={xr ? "text-primary" : "text-muted-foreground"}
          >
            <rect x="5" y="9" width="14" height="6" rx="3" />
          </svg>
        </button>
        {/* Pills button (two circles) */}
        <button
          type="button"
          onClick={() => saveFlags({ pills: !pills })}
          className={`h-7 w-7 inline-flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
            pills
              ? "border-primary bg-primary/15"
              : "border-border bg-background/60 hover:bg-accent/30"
          }`}
          aria-pressed={pills}
          aria-label="Toggle pills"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            className={pills ? "text-primary" : "text-muted-foreground"}
          >
            <circle cx="9" cy="12" r="3" />
            <circle cx="15" cy="12" r="3" />
          </svg>
        </button>
      </div>
      {/* Day Header */}
      <div className="mb-5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Calendar
            className={`h-3.5 w-3.5 ${
              today ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <div
            className={`text-xs uppercase tracking-wider font-medium ${
              today ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {dayName}
          </div>
        </div>
        <div
          className={`text-3xl font-light tracking-tight ${
            today ? "text-primary font-medium" : "text-foreground"
          }`}
        >
          {today ? (
            <span className="relative inline-flex items-center justify-center">
              <span
                className="absolute inset-0 rounded-full bg-primary/10 blur-sm opacity-40"
                aria-hidden
              />
              <span className="relative z-10">{dayNum}</span>
            </span>
          ) : (
            dayNum
          )}
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-2.5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-start gap-2.5 group p-1.5 rounded-md hover:bg-accent/30 transition-colors"
          >
            <Checkbox
              checked={goal.is_completed}
              onCheckedChange={() => onToggleGoal(goal)}
              className="mt-0.5 cursor-pointer"
            />
            {editingGoalId === goal.id ? (
              <Input
                type="text"
                value={editGoalText}
                onChange={(e) => setEditGoalText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={saveEdit}
                className="flex-1 h-7 text-sm"
                autoFocus
              />
            ) : (
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed break-words cursor-pointer transition-colors ${
                    goal.is_completed
                      ? "line-through text-muted-foreground/70"
                      : "text-foreground"
                  }`}
                  onClick={() => startEdit(goal.id, goal.goal_text)}
                >
                  {goal.goal_text}
                </p>
              </div>
            )}
            <button
              onClick={() => onDeleteGoal(goal)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-0.5 rounded hover:bg-destructive/10"
              aria-label="Delete goal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Inline Add Goal */}
        <Input
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onBlur={handleAddGoal}
          onKeyDown={handleKeyDown}
          placeholder="Add goal..."
          className="inline-add-input text-sm mt-1"
        />
      </div>
    </Card>
  );
}
