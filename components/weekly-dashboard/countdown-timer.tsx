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
  const target = new Date(targetDate)
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
      setSelectedDate(new Date(event.target_date))
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
      <div className="h-14 w-auto">
        <Card className="h-full bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 flex items-center">
          <CardContent className="px-3 md:px-4 py-0 h-full flex items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              + Add countdown
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="h-14 w-auto">
        <Card className="h-full bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 flex items-center">
          <CardContent className="px-3 md:px-4 py-0 h-full flex items-center">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event name..."
                className="h-7 text-xs w-32"
                autoFocus
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 w-[110px] text-xs justify-start"
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {selectedDate ? format(selectedDate, "MMM d") : "Date"}
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
              <Button type="button" onClick={handleSave} size="sm" className="h-7 text-xs px-2">
                Save
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
              >
                Cancel
              </Button>
              {event && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (event) {
    const { weeks, days } = calculateCountdown(event.target_date)
    const targetDate = new Date(event.target_date)
    const formattedDate = format(targetDate, "EEE, MMM d, yyyy").toUpperCase()

    return (
      <div className="group h-14 w-auto">
        <Card className="h-full bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 flex items-center">
          <CardContent className="px-3 md:px-4 py-0 h-full flex items-center whitespace-nowrap">
            <div className="flex items-start gap-2">
              <div>
                <div className="text-lg font-semibold text-primary leading-tight">
                  {weeks} {weeks === 1 ? "week" : "weeks"}{" "}
                  {days} {days === 1 ? "day" : "days"}
                </div>
                <div className="text-sm text-muted-foreground leading-tight">
                  until <span className="text-foreground">{event.event_name}, {formattedDate}</span>
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-accent rounded"
                aria-label="Edit countdown"
              >
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
