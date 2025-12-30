"use client"

import { DayCard } from "./day-card"
import { formatDate } from "@/lib/date-utils"

interface DailyGoal {
  id: string
  goal_date: string
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface DailyGridProps {
  weekDates: Date[]
  dailyGoals: Record<string, DailyGoal[]>
  onToggleGoal: (goal: DailyGoal) => void
  onAddGoal: (dateStr: string, goalText: string) => void
  onDeleteGoal: (goal: DailyGoal) => void
}

export function DailyGrid({
  weekDates,
  dailyGoals,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
}: DailyGridProps) {
  return (
    <div className="daily-grid">
      {weekDates.map((date) => {
        const dateStr = formatDate(date)
        const goals = dailyGoals[dateStr] || []

        return (
          <DayCard
            key={dateStr}
            date={date}
            dateStr={dateStr}
            goals={goals}
            onToggleGoal={onToggleGoal}
            onAddGoal={(goalText) => onAddGoal(dateStr, goalText)}
            onDeleteGoal={onDeleteGoal}
          />
        )
      })}
    </div>
  )
}
