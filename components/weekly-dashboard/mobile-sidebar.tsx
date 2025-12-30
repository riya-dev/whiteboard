"use client"

import { SidebarWeekly } from "./sidebar-weekly"

interface LookaheadData {
  this_week_text: string
  next_week_text: string
  learnings_text: string
}

interface MobileSidebarProps {
  lookahead: LookaheadData
  onUpdateLookahead: (field: keyof LookaheadData, value: string) => void
}

export function MobileSidebar({ lookahead, onUpdateLookahead }: MobileSidebarProps) {
  return (
    <div className="mobile-sidebar-stack mb-6">
      <SidebarWeekly lookahead={lookahead} onUpdateLookahead={onUpdateLookahead} />
    </div>
  )
}
