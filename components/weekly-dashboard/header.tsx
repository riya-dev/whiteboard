"use client"

import { Button } from "@/components/ui/button"
import { WeekPicker } from "./week-picker"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  weekStart: Date
  onWeekChange: (newWeekStart: Date) => void
}

export function DashboardHeader({ weekStart, onWeekChange }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      {/* Center: Week Picker */}
      <div className="flex-1 flex justify-center">
        <WeekPicker weekStart={weekStart} onWeekChange={onWeekChange} />
      </div>

      {/* Right: Sign Out */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button type="button" variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
