"use client"

import { Card, CardContent } from "@/components/ui/card"
import { calculateDisciplineStatistics } from "@/lib/completion-utils"
import type { HeatmapDay } from "@/lib/date-utils"
import type { DisciplineTrackingData } from "@/lib/completion-utils"

interface DisciplineStatisticsCardProps {
  heatmapData: HeatmapDay[]
  tracking: DisciplineTrackingData[]
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function DisciplineStatisticsCard({ heatmapData, tracking }: DisciplineStatisticsCardProps) {
  const stats = calculateDisciplineStatistics(heatmapData, tracking)

  return (
    <Card className="bg-gradient-to-br from-card to-muted/5 border-border/50">
      <CardContent className="py-6">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-foreground">
                AM Check-ins
              </div>
              <div className="text-lg font-semibold text-primary">
                {stats.amCheckin.percentage}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {stats.amCheckin.completed} out of {stats.amCheckin.total}
            </div>
            <ProgressBar percentage={stats.amCheckin.percentage} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-foreground">
                PM Check-ins
              </div>
              <div className="text-lg font-semibold text-primary">
                {stats.pmCheckin.percentage}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {stats.pmCheckin.completed} out of {stats.pmCheckin.total}
            </div>
            <ProgressBar percentage={stats.pmCheckin.percentage} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-foreground">
                Next Day Goal Settings
              </div>
              <div className="text-lg font-semibold text-primary">
                {stats.setGoalsTomorrow.percentage}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {stats.setGoalsTomorrow.completed} out of {stats.setGoalsTomorrow.total}
            </div>
            <ProgressBar percentage={stats.setGoalsTomorrow.percentage} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
