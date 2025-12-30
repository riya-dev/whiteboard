"use client"

import { calculateGoalsStatistics } from "@/lib/completion-utils"
import type { HeatmapDay } from "@/lib/date-utils"

interface GoalsStatisticsCardProps {
  heatmapData: HeatmapDay[]
}

export function GoalsStatisticsCard({ heatmapData }: GoalsStatisticsCardProps) {
  const stats = calculateGoalsStatistics(heatmapData)

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-primary">
            {stats.percentage}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.completedGoals} goals completed out of {stats.totalGoals} set
          </div>
        </div>
      </div>
    </div>
  )
}
