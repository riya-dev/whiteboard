"use client"

import { useState } from "react"
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
  onDeleteGoal: (goal: DailyGoal) => void
}

export function DayCard({
  date,
  dateStr,
  goals,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
}: DayCardProps) {
  const [newGoalText, setNewGoalText] = useState("")
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

  return (
    <Card
      className={`p-4 transition-all ${
        today ? "border-primary bg-accent/20" : "border-border bg-card"
      }`}
    >
      {/* Day Header */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{dayName}</div>
        </div>
        <div className={`text-2xl font-light ${today ? "text-primary" : "text-foreground"}`}>
          {dayNum}
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-start gap-2 group">
            <Checkbox
              checked={goal.is_completed}
              onCheckedChange={() => onToggleGoal(goal)}
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
              onClick={() => onDeleteGoal(goal)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              aria-label="Delete goal"
            >
              <X className="h-3 w-3" />
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
          className="inline-add-input text-sm"
        />
      </div>
    </Card>
  )
}
