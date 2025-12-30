"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getShortDayName } from "@/lib/date-utils"
import { calculateWeeklyDisciplinePercentage } from "@/lib/completion-utils"
import type { DisciplineTrackingData } from "@/lib/completion-utils"

interface DisciplineCardProps {
  weekDates: Date[]
  tracking: DisciplineTrackingData[]
  onToggle: (dateStr: string, field: "am_checkin" | "pm_checkin" | "set_goals_tomorrow") => void
}

export function DisciplineCard({ weekDates, tracking, onToggle }: DisciplineCardProps) {
  const weekDateStrs = weekDates.map((d) => d.toISOString().split("T")[0])
  const disciplinePercentage = calculateWeeklyDisciplinePercentage(weekDateStrs, tracking)

  const getDayTracking = (dateStr: string): DisciplineTrackingData | undefined => {
    return tracking.find((t) => t.track_date === dateStr)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-light">Discipline</CardTitle>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">{disciplinePercentage}%</span> this week
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split("T")[0]
            const dayTracking = getDayTracking(dateStr)
            const dayName = getShortDayName(date)

            return (
              <div key={dateStr} className="discipline-day-row">
                <div className="discipline-day-label">{dayName}</div>

                <div className="flex items-center gap-3 flex-1">
                  {/* AM Check-in */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.am_checkin || false}
                      onCheckedChange={() => onToggle(dateStr, "am_checkin")}
                    />
                    <span>AM Check-in</span>
                  </label>

                  {/* PM Check-in */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.pm_checkin || false}
                      onCheckedChange={() => onToggle(dateStr, "pm_checkin")}
                    />
                    <span>PM Check-in</span>
                  </label>

                  {/* Set goals for tomorrow */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.set_goals_tomorrow || false}
                      onCheckedChange={() =>
                        onToggle(dateStr, "set_goals_tomorrow")
                      }
                    />
                    <span>Set Goals for Tomorrow</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
