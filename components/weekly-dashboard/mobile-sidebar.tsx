"use client"

import { SidebarWeekly } from "./sidebar-weekly"
import type { LookaheadItem } from "./lookahead-list"

interface WeeklyGoal {
  id: string
  goal_text: string
  is_completed: boolean
  cadence: "weekly" | "biweekly"
  period_start_date: string
}

interface MobileSidebarProps {
  weeklyGoals: WeeklyGoal[]
  cadence: "weekly" | "biweekly"
  onToggleWeeklyGoal: (id: string) => void
  onAddWeeklyGoal: (text: string) => void
  onUpdateWeeklyGoal: (id: string, text: string) => void
  onDeleteWeeklyGoal: (id: string) => void
  onCadenceChange: (cadence: "weekly" | "biweekly") => void
  thisWeekItems: LookaheadItem[]
  nextWeekItems: LookaheadItem[]
  onAddLookaheadItem: (section: "this_week" | "next_week", text: string) => void
  onUpdateLookaheadItem: (id: string, text: string) => void
  onDeleteLookaheadItem: (id: string) => void
  learningsText: string
  onUpdateLearnings: (text: string) => void
}

export function MobileSidebar(props: MobileSidebarProps) {
  return (
    <div className="mobile-sidebar-stack mb-6">
      <SidebarWeekly {...props} />
    </div>
  )
}
