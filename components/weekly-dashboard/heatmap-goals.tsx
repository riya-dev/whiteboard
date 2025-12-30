"use client"

import { Heatmap } from "./heatmap"
import { getLast365Days } from "@/lib/date-utils"
import { buildGoalsHeatmapData } from "@/lib/completion-utils"
import type { DailyGoalData } from "@/lib/completion-utils"

interface GoalsHeatmapProps {
  goals: DailyGoalData[]
}

export function GoalsHeatmap({ goals }: GoalsHeatmapProps) {
  const dates = getLast365Days()
  const heatmapData = buildGoalsHeatmapData(dates, goals)

  return <Heatmap title="Goals" data={heatmapData} colorScale="goals" />
}
