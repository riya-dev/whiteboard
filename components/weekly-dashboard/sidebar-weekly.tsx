"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { X } from "lucide-react"
import { LookaheadList, type LookaheadItem } from "./lookahead-list"
import { getBiweeklyEndMonday, formatBiweeklyEndDate } from "@/lib/date-utils"

interface WeeklyGoal {
  id: string
  goal_text: string
  is_completed: boolean
  cadence: "weekly" | "biweekly"
  period_start_date: string
}

interface SidebarWeeklyProps {
  // Weekly goals
  weeklyGoals: WeeklyGoal[]
  cadence: "weekly" | "biweekly"
  onToggleWeeklyGoal: (id: string) => void
  onAddWeeklyGoal: (text: string) => void
  onUpdateWeeklyGoal: (id: string, text: string) => void
  onDeleteWeeklyGoal: (id: string) => void
  onCadenceChange: (cadence: "weekly" | "biweekly") => void

  // Lookahead items
  thisWeekItems: LookaheadItem[]
  nextWeekItems: LookaheadItem[]
  onAddLookaheadItem: (section: "this_week" | "next_week", text: string) => void
  onUpdateLookaheadItem: (id: string, text: string) => void
  onDeleteLookaheadItem: (id: string) => void
}

export function SidebarWeekly({
  weeklyGoals,
  cadence,
  onToggleWeeklyGoal,
  onAddWeeklyGoal,
  onUpdateWeeklyGoal,
  onDeleteWeeklyGoal,
  onCadenceChange,
  thisWeekItems,
  nextWeekItems,
  onAddLookaheadItem,
  onUpdateLookaheadItem,
  onDeleteLookaheadItem,
}: SidebarWeeklyProps) {
  const [newGoalText, setNewGoalText] = useState("")
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editGoalText, setEditGoalText] = useState("")

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      onAddWeeklyGoal(newGoalText.trim())
      setNewGoalText("")
    }
  }

  const startEditGoal = (id: string, currentText: string) => {
    setEditingGoalId(id)
    setEditGoalText(currentText)
  }

  const saveEditGoal = () => {
    if (editingGoalId && editGoalText.trim()) {
      onUpdateWeeklyGoal(editingGoalId, editGoalText.trim())
    }
    setEditingGoalId(null)
    setEditGoalText("")
  }

  // Calculate biweekly end date if applicable
  const biweeklyEndDate =
    cadence === "biweekly" && weeklyGoals.length > 0
      ? formatBiweeklyEndDate(getBiweeklyEndMonday(weeklyGoals[0].period_start_date))
      : null

  return (
    <Card className="weekly-sidebar">
      <CardContent className="space-y-6 pt-6">
        {/* Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">
              Goals
            </h3>
            <ToggleGroup
              type="single"
              value={cadence}
              onValueChange={(val) =>
                val && onCadenceChange(val as "weekly" | "biweekly")
              }
              className="gap-1"
            >
              <ToggleGroupItem value="weekly" className="h-7 px-3 text-xs">
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="biweekly" className="h-7 px-3 text-xs">
                Biweekly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Biweekly end date display */}
          {biweeklyEndDate && (
            <p className="text-xs text-muted-foreground mb-2">
              Goals end {biweeklyEndDate}
            </p>
          )}

          {/* Goals list */}
          <div className="space-y-2">
            {weeklyGoals.map((goal) => (
              <div
                key={goal.id}
                className="group flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={goal.is_completed}
                  onCheckedChange={() => onToggleWeeklyGoal(goal.id)}
                  className="mt-0.5"
                />
                {editingGoalId === goal.id ? (
                  <Input
                    type="text"
                    value={editGoalText}
                    onChange={(e) => setEditGoalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEditGoal();
                      } else if (e.key === "Escape") {
                        setEditingGoalId(null);
                        setEditGoalText("");
                      }
                    }}
                    onBlur={saveEditGoal}
                    className="flex-1 h-7 text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm cursor-pointer ${
                      goal.is_completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                    onClick={() => startEditGoal(goal.id, goal.goal_text)}
                  >
                    {goal.goal_text}
                  </span>
                )}
                <button
                  onClick={() => onDeleteWeeklyGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  aria-label="Delete goal"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}

            {/* Inline add input */}
            <div className="flex items-start gap-2 p-2">
              <Checkbox disabled className="mt-0.5 opacity-30" />
              <Input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGoal();
                  }
                }}
                placeholder="Add goal..."
                className="inline-add-input flex-1 h-7 text-sm border-0 bg-transparent focus-visible:ring-1"
              />
            </div>
          </div>
        </div>

        {/* Look Ahead Section */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">
            Look Ahead
          </h3>

          <div className="space-y-4">
            {/* This week */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                This week:
              </label>
              <LookaheadList
                items={thisWeekItems}
                onAdd={(text) => onAddLookaheadItem("this_week", text)}
                onUpdate={onUpdateLookaheadItem}
                onDelete={onDeleteLookaheadItem}
                placeholder="What's coming up this week?"
              />
            </div>

            {/* Next week */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Next week:
              </label>
              <LookaheadList
                items={nextWeekItems}
                onAdd={(text) => onAddLookaheadItem("next_week", text)}
                onUpdate={onUpdateLookaheadItem}
                onDelete={onDeleteLookaheadItem}
                placeholder="What's coming up next week?"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
