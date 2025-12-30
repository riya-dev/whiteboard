"use client"

import { Card, CardContent } from "@/components/ui/card"
import { calculateDisciplineStatistics } from "@/lib/completion-utils"
import type { HeatmapDay } from "@/lib/date-utils"
import type { DisciplineTrackingData } from "@/lib/completion-utils"

interface DisciplineStatisticsCardProps {
  heatmapData: HeatmapDay[]
  tracking: DisciplineTrackingData[]
}

export function DisciplineStatisticsCard({ heatmapData, tracking }: DisciplineStatisticsCardProps) {
  const stats = calculateDisciplineStatistics(heatmapData, tracking)

  return (
    <Card className="bg-gradient-to-br from-card to-muted/5 border-border/50">
      <CardContent className="py-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              AM Check-ins
            </div>
            <div className="text-xl font-semibold text-primary">
              {stats.amCheckin.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.amCheckin.completed} out of {stats.amCheckin.total}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              PM Check-ins
            </div>
            <div className="text-xl font-semibold text-primary">
              {stats.pmCheckin.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.pmCheckin.completed} out of {stats.pmCheckin.total}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              Next Day Goal Settings
            </div>
            <div className="text-xl font-semibold text-primary">
              {stats.setGoalsTomorrow.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.setGoalsTomorrow.completed} out of {stats.setGoalsTomorrow.total}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
