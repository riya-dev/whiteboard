"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

interface CountdownEvent {
  id: string
  event_name: string
  target_date: string
}

interface CountdownTimerProps {
  events: CountdownEvent[]
  onAddEvent: (eventName: string, targetDate: string) => void
  onDeleteEvent: (id: string) => void
}

function calculateCountdown(targetDate: string): { weeks: number; days: number } {
  const now = new Date()
  const target = new Date(targetDate)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const weeks = Math.floor(diffDays / 7)
  const days = diffDays % 7

  return { weeks, days }
}

export function CountdownTimer({ events, onAddEvent, onDeleteEvent }: CountdownTimerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [eventName, setEventName] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const handleAdd = () => {
    if (eventName.trim() && selectedDate) {
      const targetDate = format(selectedDate, "yyyy-MM-dd")
      onAddEvent(eventName.trim(), targetDate)
      setEventName("")
      setSelectedDate(undefined)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setEventName("")
    setSelectedDate(undefined)
    setIsAdding(false)
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        {events.length === 0 && !isAdding ? (
          <Button
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            + Add countdown
          </Button>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const { weeks, days } = calculateCountdown(event.target_date)
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 text-sm font-medium">
                    <span className="text-primary font-semibold">
                      {weeks} {weeks === 1 ? "week" : "weeks"}{" "}
                      {days} {days === 1 ? "day" : "days"}
                    </span>
                    <span className="text-muted-foreground"> until </span>
                    <span className="text-foreground">{event.event_name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                    aria-label="Delete countdown"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              )
            })}

            {isAdding ? (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Event name..."
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 w-[140px] text-xs justify-start"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleAdd} size="sm" className="h-8 text-xs">
                  Add
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsAdding(true)}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                + Add another
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
