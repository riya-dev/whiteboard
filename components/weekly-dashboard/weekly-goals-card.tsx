"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { X } from "lucide-react"

interface WeeklyGoal {
  id: string
  goal_text: string
  is_completed: boolean
  cadence: "weekly" | "biweekly"
  goal_order: number
}

interface WeeklyGoalsCardProps {
  goals: WeeklyGoal[]
  cadence: "weekly" | "biweekly"
  onCadenceChange: (cadence: "weekly" | "biweekly") => void
  onToggleGoal: (goal: WeeklyGoal) => void
  onAddGoal: (goalText: string, cadence: "weekly" | "biweekly") => void
  onDeleteGoal: (goal: WeeklyGoal) => void
}

export function WeeklyGoalsCard({
  goals,
  cadence,
  onCadenceChange,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
}: WeeklyGoalsCardProps) {
  const [newGoalText, setNewGoalText] = useState("")

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      onAddGoal(newGoalText, cadence)
      setNewGoalText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddGoal()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-light">Weekly Goals</CardTitle>
          <ToggleGroup
            type="single"
            value={cadence}
            onValueChange={(value) => {
              if (value) onCadenceChange(value as "weekly" | "biweekly")
            }}
            className="gap-0"
          >
            <ToggleGroupItem value="weekly" aria-label="Weekly cadence" className="text-xs px-3">
              Weekly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="biweekly"
              aria-label="Biweekly cadence"
              className="text-xs px-3"
            >
              Biweekly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-start gap-2 group">
              <Checkbox
                checked={goal.is_completed}
                onCheckedChange={() => onToggleGoal(goal)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed break-words ${
                    goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {goal.goal_text}
                </p>
              </div>
              <button
                onClick={() => onDeleteGoal(goal)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label="Delete goal"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Inline Add Goal */}
          <Input
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onBlur={handleAddGoal}
            onKeyDown={handleKeyDown}
            placeholder="Add weekly goal..."
            className="inline-add-input text-sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}
