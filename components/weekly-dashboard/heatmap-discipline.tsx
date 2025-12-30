"use client"

import { Heatmap } from "./heatmap"
import { getLast365Days } from "@/lib/date-utils"
import { buildDisciplineHeatmapData } from "@/lib/completion-utils"
import type { DisciplineTrackingData } from "@/lib/completion-utils"

interface DisciplineHeatmapProps {
  tracking: DisciplineTrackingData[]
}

export function DisciplineHeatmap({ tracking }: DisciplineHeatmapProps) {
  const dates = getLast365Days()
  const heatmapData = buildDisciplineHeatmapData(dates, tracking)

  return <Heatmap title="Discipline Completion" data={heatmapData} colorScale="discipline" />
}
