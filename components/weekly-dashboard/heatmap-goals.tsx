"use client"

import { Heatmap } from "./heatmap"
import { GoalsStatisticsCard } from "./goals-statistics-card"
import { getLast365Days } from "@/lib/date-utils"
import {
  buildGoalsHeatmapData,
  calculateWeeklyGoalsPercentage,
} from "@/lib/completion-utils";
import type { DailyGoalData } from "@/lib/completion-utils"

interface GoalsHeatmapProps {
  goals: DailyGoalData[];
  weekDates?: string[]; // Optional week dates for weekly percentage
}

export function GoalsHeatmap({ goals, weekDates }: GoalsHeatmapProps) {
  const dates = getLast365Days();
  const heatmapData = buildGoalsHeatmapData(dates, goals);

  // Calculate weekly percentage if week dates provided
  const weeklyPercentage = weekDates
    ? calculateWeeklyGoalsPercentage(weekDates, goals)
    : null;

  return (
    <div className="space-y-3">
      <Heatmap
        title="Goals"
        data={heatmapData}
        colorScale="goals"
        tooltipType="goals"
        statisticsElement={<GoalsStatisticsCard heatmapData={heatmapData} />}
      />

      {/* Weekly percentage below heatmap */}
      {weeklyPercentage !== null && (
        <div className="flex justify-end">
          <div className="text-sm font-medium">
            <span className="text-lg font-semibold text-primary">{weeklyPercentage}%</span>
            <span className="text-muted-foreground ml-2">this week</span>
          </div>
        </div>
      )}
    </div>
  );
}
