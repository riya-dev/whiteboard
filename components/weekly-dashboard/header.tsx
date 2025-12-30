"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WeekPicker } from "./week-picker"
import { Menu, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  weekStart: Date
  onWeekChange: (newWeekStart: Date) => void
  onMenuClick?: () => void
}

export function DashboardHeader({ weekStart, onWeekChange, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      {/* Left: Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onMenuClick}
        className="flex-shrink-0"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center: Week Picker */}
      <div className="flex-1 flex justify-center">
        <WeekPicker weekStart={weekStart} onWeekChange={onWeekChange} />
      </div>

      {/* Right: Placeholder Card & Sign Out */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Card className="px-4 py-2 text-sm text-muted-foreground">
          Heading 1
        </Card>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
