"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getShortDayName } from "@/lib/date-utils"
import type { DisciplineTrackingData } from "@/lib/completion-utils"

interface DisciplineCardProps {
  weekDates: Date[]
  tracking: DisciplineTrackingData[]
  onToggle: (dateStr: string, field: "am_checkin" | "pm_checkin" | "set_goals_tomorrow") => void
}

export function DisciplineCard({ weekDates, tracking, onToggle }: DisciplineCardProps) {
  const getDayTracking = (dateStr: string): DisciplineTrackingData | undefined => {
    return tracking.find((t) => t.track_date === dateStr)
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/5 border-border/50">
      <CardContent className="pt-6">
        <div className="space-y-2">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split("T")[0]
            const dayTracking = getDayTracking(dateStr)
            const dayName = getShortDayName(date)

            return (
              <div key={dateStr} className="discipline-day-row">
                <div className="discipline-day-label">{dayName}</div>

                <div className="flex items-center gap-3 flex-1">
                  {/* AM Check-in */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.am_checkin || false}
                      onCheckedChange={() => onToggle(dateStr, "am_checkin")}
                    />
                    <span className="cursor-pointer select-none" onClick={() => onToggle(dateStr, "am_checkin")}>
                      AM Check-in
                    </span>
                  </div>

                  {/* PM Check-in */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.pm_checkin || false}
                      onCheckedChange={() => onToggle(dateStr, "pm_checkin")}
                    />
                    <span className="cursor-pointer select-none" onClick={() => onToggle(dateStr, "pm_checkin")}>
                      PM Check-in
                    </span>
                  </div>

                  {/* Set goals for tomorrow */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={dayTracking?.set_goals_tomorrow || false}
                      onCheckedChange={() =>
                        onToggle(dateStr, "set_goals_tomorrow")
                      }
                    />
                    <span className="cursor-pointer select-none" onClick={() => onToggle(dateStr, "set_goals_tomorrow")}>
                      Set Goals for Tomorrow
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
