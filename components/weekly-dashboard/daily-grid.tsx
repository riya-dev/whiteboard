"use client"

import { DayCard } from "./day-card"
import { formatDate } from "@/lib/date-utils"
import { calculateWeeklyGoalsPercentage } from "@/lib/completion-utils"

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
  onUpdateGoal: (goalId: string, dateStr: string, goalText: string) => void
  onDeleteGoal: (goal: DailyGoal) => void
}

export function DailyGrid({ weekDates, dailyGoals, onToggleGoal, onAddGoal, onUpdateGoal, onDeleteGoal }: DailyGridProps) {
  // Calculate weekly percentage
  const weekDateStrs = weekDates.map((d) => formatDate(d))
  const allGoals = Object.values(dailyGoals).flat()
  const weeklyPercentage = calculateWeeklyGoalsPercentage(weekDateStrs, allGoals)

  return (
    <div className="relative">
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
              onUpdateGoal={(goalId, goalText) => onUpdateGoal(goalId, dateStr, goalText)}
              onDeleteGoal={onDeleteGoal}
            />
          )
        })}
      </div>

      {/* Weekly percentage in bottom right */}
      <div className="flex justify-end mt-3">
        <div className="text-sm font-medium">
          <span className="text-lg font-semibold text-primary">{weeklyPercentage}%</span>
          <span className="text-muted-foreground ml-2">this week</span>
        </div>
      </div>
    </div>
  )
}
