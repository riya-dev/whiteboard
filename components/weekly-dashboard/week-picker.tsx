"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getTuesdayWeekStart, formatWeekDisplay } from "@/lib/date-utils"
import { CalendarIcon } from "lucide-react"

interface WeekPickerProps {
  weekStart: Date
  onWeekChange: (newWeekStart: Date) => void
}

export function WeekPicker({ weekStart, onWeekChange }: WeekPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const tuesdayStart = getTuesdayWeekStart(date)
      onWeekChange(tuesdayStart)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="week-picker-pill">
          <CalendarIcon className="h-4 w-4" />
          <span>{formatWeekDisplay(weekStart)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={weekStart}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
