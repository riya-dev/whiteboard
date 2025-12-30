"use client"

import HeatMap from "@uiw/react-heat-map"
import type { HeatmapDay } from "@/lib/date-utils"
import { formatDateWithOrdinal } from "@/lib/date-utils"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface HeatmapProps {
  title: string
  data: HeatmapDay[]
  colorScale: "goals" | "discipline"
  tooltipType: "goals" | "discipline"
  statisticsElement?: React.ReactNode
}

export function Heatmap({ title, data, colorScale, tooltipType, statisticsElement }: HeatmapProps) {
  // Transform data to react-heat-map format with metadata
  const heatmapValue = data.map((day) => ({
    date: day.date.replace(/-/g, "/"), // Convert YYYY-MM-DD to YYYY/MM/DD for Safari support
    count: day.intensity, // Use intensity (0-4) directly as count for color mapping
    content: `${day.count || 0}/${day.total || 0}`, // Store actual count/total for tooltip
    metadata: day.metadata, // Pass through metadata for discipline tooltips
  }))

  // Get color based on intensity level (0-4)
  const getColor = (intensity: number): string => {
    const prefix = colorScale === "goals" ? "heatmap-goals" : "heatmap-discipline"
    return `var(--${prefix}-${intensity})`
  }

  // Generate tooltip content for discipline heatmap
  const generateDisciplineTooltip = (cellData: any, formattedDate: string): string => {
    const metadata = cellData.metadata
    if (!metadata) return `No habits tracked on ${formattedDate}`

    const completed = []
    if (metadata.am_checkin) completed.push("AM Check-in")
    if (metadata.pm_checkin) completed.push("PM Check-in")
    if (metadata.set_goals_tomorrow) completed.push("next day goal-setting")

    if (completed.length === 0) return `No habits completed on ${formattedDate}`

    return `${completed.join(", ")} completed on ${formattedDate}`
  }

  // Generate tooltip content based on type
  const generateTooltipContent = (cellData: any): string => {
    const dateStr = cellData.date // YYYY/MM/DD format from library
    const formattedDate = formatDateWithOrdinal(dateStr)

    if (tooltipType === "goals") {
      const content = cellData.content || "0/0"
      const [, total] = content.split("/")
      if (total === "0") return `No goals set on ${formattedDate}`
      return `${content} goals completed on ${formattedDate}`
    } else {
      return generateDisciplineTooltip(cellData, formattedDate)
    }
  }

  // Create color mapping based on intensity (0-4)
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

      {statisticsElement && <div>{statisticsElement}</div>}

      <div className="overflow-x-auto">
        <div style={{ minWidth: 'fit-content' }}>
          <TooltipProvider delayDuration={100}>
            <HeatMap
              value={heatmapValue}
              startDate={startDate}
              endDate={endDate}
              panelColors={panelColors}
              weekLabels={["", "M", "", "W", "", "F", ""]}
              rectSize={14}
              space={4}
              width={1100}
              rectProps={{
                rx: 2,
              }}
              legendRender={() => null as any}
              rectRender={(props, data) => {
                const intensity = (data as any).count || 0
                const cellData = data as any
                const tooltipContent = generateTooltipContent(cellData)

                return (
                  <Tooltip key={props.key}>
                    <TooltipTrigger asChild>
                      <rect
                        {...props}
                        fill={getColor(intensity)}
                        style={{ cursor: 'pointer' }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{tooltipContent}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }}
            />
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
