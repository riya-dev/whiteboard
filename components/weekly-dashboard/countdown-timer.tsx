"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Pencil, X } from "lucide-react"
import { format } from "date-fns"

interface CountdownEvent {
  id: string
  event_name: string
  target_date: string
}

interface CountdownTimerProps {
  event: CountdownEvent | null
  onSaveEvent: (eventName: string, targetDate: string) => void
  onUpdateEvent: (id: string, eventName: string, targetDate: string) => void
  onDeleteEvent: (id: string) => void
}

function calculateCountdown(targetDate: string): { weeks: number; days: number } {
  const now = new Date()
  // Parse as local time to avoid timezone issues
  const target = new Date(targetDate + "T00:00:00")
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const weeks = Math.floor(diffDays / 7)
  const days = diffDays % 7

  return { weeks, days }
}

export function CountdownTimer({ event, onSaveEvent, onUpdateEvent, onDeleteEvent }: CountdownTimerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [eventName, setEventName] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const handleEdit = () => {
    if (event) {
      setEventName(event.event_name)
      // Parse as local time to avoid timezone issues
      setSelectedDate(new Date(event.target_date + "T00:00:00"))
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (eventName.trim() && selectedDate) {
      const targetDate = format(selectedDate, "yyyy-MM-dd")
      if (event) {
        onUpdateEvent(event.id, eventName.trim(), targetDate)
      } else {
        onSaveEvent(eventName.trim(), targetDate)
      }
      setEventName("")
      setSelectedDate(undefined)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEventName("")
    setSelectedDate(undefined)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (event) {
      onDeleteEvent(event.id)
      setIsEditing(false)
    }
  }

  if (!event && !isEditing) {
    return (
      <div className="w-auto">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Add countdown</span>
        </button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="w-auto">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event name..."
                className="h-9 text-sm w-40 flex-1 min-w-[160px]"
                autoFocus
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-[130px] text-sm justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={handleSave} size="sm" className="h-9 text-sm px-4">
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm px-4"
                >
                  Cancel
                </Button>
                {event && (
                  <Button
                    type="button"
                    onClick={handleDelete}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (event) {
    const { weeks, days } = calculateCountdown(event.target_date)
    // Parse as local time to avoid timezone issues
    const targetDate = new Date(event.target_date + "T00:00:00")
    const formattedDate = format(targetDate, "EEE, MMM d, yyyy").toUpperCase()

    return (
      <Card className="group h-full border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="h-full px-4 py-0 flex items-center">
          <div className="flex items-center gap-3 w-full">
            {/* Event name and icon */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary/60" />
              <span className="font-medium text-sm text-foreground whitespace-nowrap">
                {event.event_name}
              </span>
            </div>

            {/* Countdown - compact horizontal layout */}
            <div className="flex items-baseline gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary tabular-nums">
                  {weeks}
                </span>
                <span className="text-xs text-muted-foreground">
                  {weeks === 1 ? "wk" : "wks"}
                </span>
              </div>
              <span className="text-muted-foreground/40">:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary tabular-nums">
                  {days}
                </span>
                <span className="text-xs text-muted-foreground">
                  {days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            {/* Date */}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedDate}
            </span>

            {/* Edit button */}
            <button
              onClick={handleEdit}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-primary/10 rounded"
              aria-label="Edit countdown"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
