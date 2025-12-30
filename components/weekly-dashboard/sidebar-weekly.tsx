"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface LookaheadData {
  this_week_text: string
  next_week_text: string
  learnings_text: string
}

interface SidebarWeeklyProps {
  lookahead: LookaheadData
  onUpdateLookahead: (field: keyof LookaheadData, value: string) => void
}

export function SidebarWeekly({ lookahead, onUpdateLookahead }: SidebarWeeklyProps) {
  const [learningsOpen, setLearningsOpen] = useState(false)

  return (
    <Card className="weekly-sidebar">
      <CardHeader>
        <CardTitle className="text-xl font-light">Weekly</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LOOK AHEAD Section */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">
            Look Ahead
          </h3>

          <div className="space-y-4">
            {/* This week */}
            <div>
              <label htmlFor="this-week" className="text-xs text-muted-foreground mb-1 block">
                This week:
              </label>
              <Textarea
                id="this-week"
                value={lookahead.this_week_text}
                onChange={(e) => onUpdateLookahead("this_week_text", e.target.value)}
                placeholder="What are you focusing on this week?"
                className="min-h-[80px] resize-none bg-background"
                rows={3}
              />
            </div>

            {/* Next week */}
            <div>
              <label htmlFor="next-week" className="text-xs text-muted-foreground mb-1 block">
                Next week:
              </label>
              <Textarea
                id="next-week"
                value={lookahead.next_week_text}
                onChange={(e) => onUpdateLookahead("next_week_text", e.target.value)}
                placeholder="What's coming up next week?"
                className="min-h-[80px] resize-none bg-background"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Learnings Section - Collapsible */}
        <Collapsible open={learningsOpen} onOpenChange={setLearningsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Learnings
            </h3>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                learningsOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Textarea
              value={lookahead.learnings_text}
              onChange={(e) => onUpdateLookahead("learnings_text", e.target.value)}
              placeholder="What did you learn this week?"
              className="min-h-[100px] resize-none bg-background"
              rows={4}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* To-do Section - Optional checkbox */}
        <div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>To-do</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
