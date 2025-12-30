"use client"

import { DayCard } from "./day-card"
import { formatDate } from "@/lib/date-utils"

interface DailyGoal {
  id: string
  user_id?: string
  goal_date: string
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface DailyFlag {
  booster: boolean
  xr: boolean
}

interface DailyGridProps {
  weekDates: Date[]
  dailyGoals: Record<string, DailyGoal[]>
  dailyFlags: Record<string, DailyFlag>
  onToggleGoal: (goal: DailyGoal) => void
  onAddGoal: (dateStr: string, goalText: string) => void
  onUpdateGoal: (goalId: string, dateStr: string, goalText: string) => void
  onDeleteGoal: (goal: DailyGoal) => void
  onToggleFlag: (dateStr: string, flagType: "booster" | "xr") => void
}

export function DailyGrid({ weekDates, dailyGoals, dailyFlags, onToggleGoal, onAddGoal, onUpdateGoal, onDeleteGoal, onToggleFlag }: DailyGridProps) {
  return (
    <div className="daily-grid">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const goals = dailyGoals[dateStr] || [];
          const flags = dailyFlags[dateStr] || { booster: false, xr: false };

          return (
            <DayCard
              key={dateStr}
              date={date}
              dateStr={dateStr}
              goals={goals}
              booster={flags.booster}
              xr={flags.xr}
              onToggleGoal={onToggleGoal}
              onAddGoal={(goalText) => onAddGoal(dateStr, goalText)}
              onUpdateGoal={(goalId, goalText) =>
                onUpdateGoal(goalId, dateStr, goalText)
              }
              onDeleteGoal={onDeleteGoal}
              onToggleBooster={() => onToggleFlag(dateStr, "booster")}
              onToggleXr={() => onToggleFlag(dateStr, "xr")}
            />
          );
        })}
    </div>
  )
}
