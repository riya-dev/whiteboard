"use client"

import HeatMap from "@uiw/react-heat-map"
import type { HeatmapDay } from "@/lib/date-utils"

interface HeatmapProps {
  title: string
  data: HeatmapDay[]
  colorScale: "goals" | "discipline"
}

export function Heatmap({ title, data, colorScale }: HeatmapProps) {
  // Debug: log data length and sample
  console.log(`${title} - Total days:`, data.length)
  console.log(`${title} - First day:`, data[0])
  console.log(`${title} - Last day:`, data[data.length - 1])
  console.log(`${title} - Sample with data:`, data.filter(d => (d.count ?? 0) > 0))

  // Transform data to react-heat-map format
  // The library uses the 'count' field to determine color, so we'll map intensity to count ranges
  const heatmapValue = data.map((day) => ({
    date: day.date.replace(/-/g, "/"), // Convert YYYY-MM-DD to YYYY/MM/DD for Safari support
    count: day.intensity, // Use intensity (0-4) directly as count for color mapping
    content: `${day.count || 0}/${day.total || 0}`, // Store actual count/total for tooltip
  }))

  // Get color based on intensity level (0-4)
  const getColor = (intensity: number): string => {
    const prefix = colorScale === "goals" ? "heatmap-goals" : "heatmap-discipline"
    return `var(--${prefix}-${intensity})`
  }

  // Create color mapping based on intensity (0-4)
  // Using object format to map exact count values to colors
  const panelColors = {
    0: getColor(0),
    1: getColor(1),
    2: getColor(2),
    3: getColor(3),
    4: getColor(4),
  }

  // Get the earliest and latest dates from data
  const startDate =
    data.length > 0 ? new Date(data[0].date.replace(/-/g, "/")) : new Date()
  const endDate =
    data.length > 0
      ? new Date(data[data.length - 1].date.replace(/-/g, "/"))
      : new Date()

  console.log(`${title} - Start date:`, startDate)
  console.log(`${title} - End date:`, endDate)
  console.log(`${title} - Heatmap value length:`, heatmapValue.length)

  return (
    <div className="space-y-3">
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

      <div className="overflow-x-auto">
        <div style={{ minWidth: 'fit-content' }}>
          <HeatMap
            value={heatmapValue}
            startDate={startDate}
            endDate={endDate}
            panelColors={panelColors}
            weekLabels={["", "M", "", "W", "", "F", ""]}
            rectSize={11}
            space={3}
            width={800}
            rectProps={{
              rx: 2,
            }}
            legendRender={() => <div />}
            rectRender={(props, data) => {
              const intensity = (data as any).count || 0
              return (
                <rect
                  {...props}
                  fill={getColor(intensity)}
                />
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}
