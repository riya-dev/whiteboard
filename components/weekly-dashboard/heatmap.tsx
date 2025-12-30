"use client"

import { groupHeatmapByWeeks, getMonthLabelsForHeatmap } from "@/lib/date-utils"
import type { HeatmapDay } from "@/lib/date-utils"

interface HeatmapProps {
  title: string
  data: HeatmapDay[]
  colorScale: "goals" | "discipline"
}

export function Heatmap({ title, data, colorScale }: HeatmapProps) {
  const weeks = groupHeatmapByWeeks(data)
  const monthLabels = getMonthLabelsForHeatmap(data)

  const getColor = (intensity: number): string => {
    const prefix = colorScale === "goals" ? "heatmap-goals" : "heatmap-discipline"
    return `var(--${prefix}-${intensity})`
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: getColor(level) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Day of week labels */}
        <div className="flex flex-col justify-start pt-5">
          <div className="flex flex-col gap-[3px]">
            {dayLabels.map((label, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground w-4 h-[11px] flex items-center"
              >
                {index % 2 === 1 ? label : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable container for month labels and heatmap */}
        <div className="flex-1 overflow-x-auto">
          {/* Month labels */}
          <div className="relative mb-1 h-4">
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="absolute text-xs text-muted-foreground"
                style={{
                  left: `${weekIndex * 14}px`,
                }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {/* Pad beginning of first week if it doesn't start on Sunday */}
                {weekIndex === 0 &&
                  week.length > 0 &&
                  Array.from({ length: new Date(week[0].date).getDay() }).map((_, padIndex) => (
                    <div key={`pad-start-${padIndex}`} className="w-[11px] h-[11px]" />
                  ))}

                {week.map((day) => {
                  const date = new Date(day.date)
                  const tooltipText = `${date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}: ${day.count || 0}/${day.total || 0}`

                  return (
                    <div
                      key={day.date}
                      className="heatmap-day"
                      style={{ backgroundColor: getColor(day.intensity) }}
                      title={tooltipText}
                    />
                  )
                })}

                {/* Pad end of last week if it doesn't end on Saturday */}
                {weekIndex === weeks.length - 1 &&
                  week.length > 0 &&
                  Array.from({
                    length: 6 - new Date(week[week.length - 1].date).getDay(),
                  }).map((_, padIndex) => (
                    <div key={`pad-end-${padIndex}`} className="w-[11px] h-[11px]" />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
