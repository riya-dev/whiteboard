"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { getTuesdayWeekStart, getTuesdayWeekDates, formatDate, getLast365Days, getDatesFromStart, isInBiweeklyPeriod } from "@/lib/date-utils"
import { format } from "date-fns"
import type { DailyGoalData, DisciplineTrackingData } from "@/lib/completion-utils"
import { buildDisciplineHeatmapData } from "@/lib/completion-utils"

// Components
import { DashboardHeader } from "./weekly-dashboard/header"
import { SidebarWeekly } from "./weekly-dashboard/sidebar-weekly"
import { MobileSidebar } from "./weekly-dashboard/mobile-sidebar"
import { DailyGrid } from "./weekly-dashboard/daily-grid"
import { DisciplineCard } from "./weekly-dashboard/discipline-card"
import { DisciplineStatisticsCard } from "./weekly-dashboard/discipline-statistics-card"
import { GoalsHeatmap } from "./weekly-dashboard/heatmap-goals"
import { DisciplineHeatmap } from "./weekly-dashboard/heatmap-discipline"
import { CountdownTimer } from "./weekly-dashboard/countdown-timer"
import { WeekPicker } from "./weekly-dashboard/week-picker"
import { BowDecorations } from "./bow-decorations"
import { Card, CardContent } from "./ui/card"
import { triggerConfetti } from "@/lib/confetti";
import type { LookaheadItem } from "./weekly-dashboard/lookahead-list"
import { LoadingWhiteboard } from "./loading-whiteboard"

// ===== TYPE DEFINITIONS =====

interface DailyGoal {
  id: string
  user_id: string
  goal_date: string
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface WeeklyGoal {
  id: string
  user_id: string
  period_start_date: string
  cadence: "weekly" | "biweekly"
  goal_text: string
  is_completed: boolean
  goal_order: number
}

interface DisciplineTracking {
  id?: string
  user_id?: string
  track_date: string
  am_checkin: boolean
  pm_checkin: boolean
  set_goals_tomorrow: boolean
}

interface DailyFlag {
  id?: string
  user_id?: string
  flag_date: string
  booster: boolean
  xr: boolean
}

interface CountdownEvent {
  id: string
  user_id: string
  event_name: string
  target_date: string
  created_at: string
}

// ===== MAIN COMPONENT =====

export default function WeeklyDashboardClient({ user }: { user: User }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getTuesdayWeekStart(new Date()))

  // State
  const [dailyGoals, setDailyGoals] = useState<Record<string, DailyGoal[]>>({})
  const [dailyFlags, setDailyFlags] = useState<Record<string, { booster: boolean; xr: boolean }>>({})
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([])
  const [weeklyGoalsCadence, setWeeklyGoalsCadence] = useState<"weekly" | "biweekly">("weekly")
  const [thisWeekItems, setThisWeekItems] = useState<LookaheadItem[]>([])
  const [nextWeekItems, setNextWeekItems] = useState<LookaheadItem[]>([])
  const [disciplineTracking, setDisciplineTracking] = useState<DisciplineTracking[]>([])

  // Heatmap data (365 days)
  const [allDailyGoals, setAllDailyGoals] = useState<DailyGoalData[]>([])
  const [allDisciplineTracking, setAllDisciplineTracking] = useState<DisciplineTrackingData[]>([])

  // Countdown event (single)
  const [countdownEvent, setCountdownEvent] = useState<CountdownEvent | null>(null)

  // ===== DATA LOADING =====

  useEffect(() => {
    loadData()
  }, [currentWeekStart])

  async function loadData() {
    setLoading(true)
    const weekDates = getTuesdayWeekDates(currentWeekStart)
    const weekDateStrs = weekDates.map(formatDate)
    const weekStartStr = formatDate(currentWeekStart)

    // Load daily goals for this week
    const { data: dailyGoalsData } = await supabase
      .from("daily_goals")
      .select("*")
      .in("goal_date", weekDateStrs)
      .order("goal_order")

    const goalsByDate: Record<string, DailyGoal[]> = {}
    weekDateStrs.forEach((date) => {
      goalsByDate[date] = dailyGoalsData?.filter((g) => g.goal_date === date) || []
    })
    setDailyGoals(goalsByDate)

    // Load weekly goals for this period (including biweekly support)
    // Fetch goals for this week AND last week (in case of biweekly)
    const lastWeekStart = new Date(currentWeekStart)
    lastWeekStart.setDate(currentWeekStart.getDate() - 7)
    const lastWeekStartStr = formatDate(lastWeekStart)

    const { data: allWeeklyGoalsData } = await supabase
      .from("weekly_goals")
      .select("*")
      .in("period_start_date", [weekStartStr, lastWeekStartStr])
      .order("goal_order")

    // Filter to show goals that are relevant for current week
    const relevantGoals = (allWeeklyGoalsData || []).filter((goal) => {
      if (goal.cadence === "weekly") {
        return goal.period_start_date === weekStartStr
      } else {
        // Biweekly: show if current week is within the 14-day period
        return isInBiweeklyPeriod(goal.period_start_date, weekStartStr)
      }
    })

    setWeeklyGoals(relevantGoals)
    if (relevantGoals.length > 0) {
      setWeeklyGoalsCadence(relevantGoals[0].cadence)
    }

    // Load lookahead items for this week
    const { data: lookaheadItemsData } = await supabase
      .from("lookahead_items")
      .select("*")
      .eq("week_start_date", weekStartStr)
      .order("item_order")

    const thisWeek = (lookaheadItemsData || [])
      .filter((item) => item.section_type === "this_week")
      .map((item) => ({ id: item.id, item_text: item.item_text, item_order: item.item_order }))

    const nextWeek = (lookaheadItemsData || [])
      .filter((item) => item.section_type === "next_week")
      .map((item) => ({ id: item.id, item_text: item.item_text, item_order: item.item_order }))

    setThisWeekItems(thisWeek)
    setNextWeekItems(nextWeek)

    // Load discipline tracking for this week
    const { data: disciplineData } = await supabase
      .from("discipline_tracking")
      .select("*")
      .in("track_date", weekDateStrs)

    setDisciplineTracking(disciplineData || [])

    // Load daily flags for this week
    const { data: flagsData } = await supabase
      .from("daily_flags")
      .select("*")
      .in("flag_date", weekDateStrs)

    const flagsByDate: Record<string, { booster: boolean; xr: boolean }> = {}
    weekDateStrs.forEach((date) => {
      const flag = flagsData?.find((f) => f.flag_date === date)
      flagsByDate[date] = flag ? { booster: flag.booster, xr: flag.xr } : { booster: false, xr: false }
    })
    setDailyFlags(flagsByDate)

    // Load all data for heatmaps (365 days)
    const last365Days = getLast365Days()

    const { data: allGoalsData } = await supabase
      .from("daily_goals")
      .select("goal_date, is_completed")
      .in("goal_date", last365Days)

    setAllDailyGoals(allGoalsData || [])

    const { data: allDisciplineData } = await supabase
      .from("discipline_tracking")
      .select("track_date, am_checkin, pm_checkin, set_goals_tomorrow")
      .in("track_date", last365Days)

    setAllDisciplineTracking(allDisciplineData || [])

    // Load countdown event (single)
    const { data: countdownData } = await supabase
      .from("countdown_events")
      .select("*")
      .order("target_date", { ascending: true })
      .limit(1)
      .single()

    setCountdownEvent(countdownData || null)

    setLoading(false)
  }

  // ===== DAILY GOALS HANDLERS =====

  async function handleToggleDailyGoal(goal: DailyGoal) {
    const { error } = await supabase
      .from("daily_goals")
      .update({ is_completed: !goal.is_completed })
      .eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => {
        const updatedForDay = prev[goal.goal_date].map((g) =>
          g.id === goal.id ? { ...g, is_completed: !g.is_completed } : g
        );
        const next = { ...prev, [goal.goal_date]: updatedForDay };
        const hasGoals = updatedForDay.length > 0;
        const allDone = hasGoals && updatedForDay.every((g) => g.is_completed);
        if (allDone) triggerConfetti("rgb(244 63 94)");
        return next;
      });
    }
  }

  async function handleAddDailyGoal(dateStr: string, goalText: string) {
    if (!goalText.trim()) return

    const existingGoals = dailyGoals[dateStr] || []
    const goalOrder = existingGoals.length + 1

    const { data, error } = await supabase
      .from("daily_goals")
      .insert({
        user_id: user.id,
        goal_date: dateStr,
        goal_text: goalText,
        goal_order: goalOrder,
        is_completed: false,
      })
      .select()
      .single()

    if (!error && data) {
      setDailyGoals((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), data],
      }))
    }
  }

  async function handleUpdateDailyGoal(goalId: string, goalDate: string, newText: string) {
    if (!newText.trim()) return

    const { error } = await supabase
      .from("daily_goals")
      .update({ goal_text: newText.trim() })
      .eq("id", goalId)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goalDate]: prev[goalDate].map((g) => (g.id === goalId ? { ...g, goal_text: newText.trim() } : g)),
      }))
    }
  }

  async function handleDeleteDailyGoal(goal: DailyGoal) {
    const { error } = await supabase.from("daily_goals").delete().eq("id", goal.id)

    if (!error) {
      setDailyGoals((prev) => ({
        ...prev,
        [goal.goal_date]: prev[goal.goal_date].filter((g) => g.id !== goal.id),
      }))
    }
  }

  // ===== WEEKLY GOALS HANDLERS =====

  async function handleToggleWeeklyGoal(goalId: string) {
    const goal = weeklyGoals.find((g) => g.id === goalId)
    if (!goal) return

    const { error } = await supabase
      .from("weekly_goals")
      .update({ is_completed: !goal.is_completed })
      .eq("id", goalId)

    if (!error) {
      setWeeklyGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, is_completed: !g.is_completed } : g)))
    }
  }

  async function handleAddWeeklyGoal(goalText: string) {
    if (!goalText.trim()) return

    const goalOrder = weeklyGoals.length + 1
    // Determine period start based on cadence
    let periodStart = formatDate(currentWeekStart)

    // If biweekly and we're in week 2, use last week's Tuesday as period start
    if (weeklyGoalsCadence === "biweekly" && weeklyGoals.length > 0) {
      periodStart = weeklyGoals[0].period_start_date
    }

    const { data, error } = await supabase
      .from("weekly_goals")
      .insert({
        user_id: user.id,
        period_start_date: periodStart,
        cadence: weeklyGoalsCadence,
        goal_text: goalText.trim(),
        goal_order: goalOrder,
        is_completed: false,
      })
      .select()
      .single()

    if (!error && data) {
      setWeeklyGoals((prev) => [...prev, data])
    }
  }

  async function handleUpdateWeeklyGoal(goalId: string, newText: string) {
    if (!newText.trim()) return

    const { error } = await supabase
      .from("weekly_goals")
      .update({ goal_text: newText.trim() })
      .eq("id", goalId)

    if (!error) {
      setWeeklyGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, goal_text: newText.trim() } : g)))
    }
  }

  async function handleDeleteWeeklyGoal(goalId: string) {
    const { error } = await supabase.from("weekly_goals").delete().eq("id", goalId)

    if (!error) {
      setWeeklyGoals((prev) => prev.filter((g) => g.id !== goalId))
    }
  }

  async function handleCadenceChange(cadence: "weekly" | "biweekly") {
    const oldCadence = weeklyGoalsCadence
    setWeeklyGoalsCadence(cadence)

    // When switching cadences, update the period_start_date if needed
    const weekStartStr = formatDate(currentWeekStart)

    if (oldCadence === "biweekly" && cadence === "weekly") {
      // Switching from biweekly to weekly: update period_start_date to current week
      await supabase
        .from("weekly_goals")
        .update({ cadence, period_start_date: weekStartStr })
        .in(
          "id",
          weeklyGoals.map((g) => g.id)
        )

      setWeeklyGoals((prev) => prev.map((g) => ({ ...g, cadence, period_start_date: weekStartStr })))
    } else {
      // Just update the cadence
      await supabase
        .from("weekly_goals")
        .update({ cadence })
        .in(
          "id",
          weeklyGoals.map((g) => g.id)
        )

      setWeeklyGoals((prev) => prev.map((g) => ({ ...g, cadence })))
    }
  }

  // ===== LOOKAHEAD ITEMS HANDLERS =====

  async function handleAddLookaheadItem(section: "this_week" | "next_week", text: string) {
    if (!text.trim()) return

    const weekStartStr = formatDate(currentWeekStart)
    const currentItems = section === "this_week" ? thisWeekItems : nextWeekItems
    const itemOrder = currentItems.length + 1

    const { data, error } = await supabase
      .from("lookahead_items")
      .insert({
        user_id: user.id,
        week_start_date: weekStartStr,
        section_type: section,
        item_text: text.trim(),
        item_order: itemOrder,
      })
      .select()
      .single()

    if (!error && data) {
      const newItem: LookaheadItem = {
        id: data.id,
        item_text: data.item_text,
        item_order: data.item_order,
      }

      if (section === "this_week") {
        setThisWeekItems((prev) => [...prev, newItem])
      } else {
        setNextWeekItems((prev) => [...prev, newItem])
      }
    }
  }

  async function handleUpdateLookaheadItem(id: string, newText: string) {
    if (!newText.trim()) return

    const { error } = await supabase
      .from("lookahead_items")
      .update({ item_text: newText.trim() })
      .eq("id", id)

    if (!error) {
      setThisWeekItems((prev) => prev.map((item) => (item.id === id ? { ...item, item_text: newText.trim() } : item)))
      setNextWeekItems((prev) => prev.map((item) => (item.id === id ? { ...item, item_text: newText.trim() } : item)))
    }
  }

  async function handleDeleteLookaheadItem(id: string) {
    const { error } = await supabase.from("lookahead_items").delete().eq("id", id)

    if (!error) {
      setThisWeekItems((prev) => prev.filter((item) => item.id !== id))
      setNextWeekItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // ===== DISCIPLINE HANDLERS =====

  async function handleToggleDiscipline(
    dateStr: string,
    field: "am_checkin" | "pm_checkin" | "set_goals_tomorrow"
  ) {
    const existing = disciplineTracking.find((t) => t.track_date === dateStr)

    if (existing) {
      const newValue = !existing[field]
      await supabase
        .from("discipline_tracking")
        .update({ [field]: newValue })
        .eq("track_date", dateStr)
        .eq("user_id", user.id)

      setDisciplineTracking((prev) => {
        const next = prev.map((t) =>
          t.track_date === dateStr ? { ...t, [field]: newValue } : t
        );
        const day = next.find((t) => t.track_date === dateStr);
        if (day && day.am_checkin && day.pm_checkin && day.set_goals_tomorrow) {
          triggerConfetti("rgb(244 63 94)");
        }
        return next;
      });
    } else {
      const { data, error } = await supabase
        .from("discipline_tracking")
        .insert({
          user_id: user.id,
          track_date: dateStr,
          am_checkin: field === "am_checkin",
          pm_checkin: field === "pm_checkin",
          set_goals_tomorrow: field === "set_goals_tomorrow",
        })
        .select()
        .single()

      if (!error && data) {
        setDisciplineTracking((prev) => {
          const next = [...prev, data];
          const day = next.find((t) => t.track_date === dateStr);
          if (
            day &&
            day.am_checkin &&
            day.pm_checkin &&
            day.set_goals_tomorrow
          ) {
            triggerConfetti("rgb(244 63 94)");
          }
          return next;
        });
      }
    }
  }

  // ===== DAILY FLAGS HANDLERS =====

  async function handleToggleFlag(dateStr: string, flagType: "booster" | "xr") {
    const existing = dailyFlags[dateStr] || { booster: false, xr: false }
    const newValue = !existing[flagType]

    // Check if record exists in database
    const { data: existingFlag } = await supabase
      .from("daily_flags")
      .select("*")
      .eq("flag_date", dateStr)
      .eq("user_id", user.id)
      .single()

    if (existingFlag) {
      // Update existing record
      await supabase
        .from("daily_flags")
        .update({ [flagType]: newValue })
        .eq("flag_date", dateStr)
        .eq("user_id", user.id)
    } else {
      // Insert new record
      await supabase
        .from("daily_flags")
        .insert({
          user_id: user.id,
          flag_date: dateStr,
          booster: flagType === "booster" ? newValue : false,
          xr: flagType === "xr" ? newValue : false,
        })
    }

    // Update local state
    setDailyFlags((prev) => ({
      ...prev,
      [dateStr]: { ...existing, [flagType]: newValue },
    }))
  }

  // ===== COUNTDOWN EVENT HANDLERS =====

  async function handleSaveCountdownEvent(eventName: string, targetDate: string) {
    const { data, error } = await supabase
      .from("countdown_events")
      .insert({
        user_id: user.id,
        event_name: eventName,
        target_date: targetDate,
      })
      .select()
      .single()

    if (!error && data) {
      setCountdownEvent(data)
    }
  }

  async function handleUpdateCountdownEvent(id: string, eventName: string, targetDate: string) {
    const { data, error } = await supabase
      .from("countdown_events")
      .update({
        event_name: eventName,
        target_date: targetDate,
      })
      .eq("id", id)
      .select()
      .single()

    if (!error && data) {
      setCountdownEvent(data)
    }
  }

  async function handleDeleteCountdownEvent(id: string) {
    const { error } = await supabase.from("countdown_events").delete().eq("id", id)

    if (!error) {
      setCountdownEvent(null)
    }
  }

  // ===== RENDER =====

  if (loading) {
    return <LoadingWhiteboard />
  }

  const weekDates = getTuesdayWeekDates(currentWeekStart)

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background relative">
      {/* Bow decorations */}
      <BowDecorations />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <DashboardHeader
          weekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
        />

        {/* Main Layout */}
        <div className="space-y-12">
          {/* ========== WHITEBOARD SECTION ========== */}
          <section className="space-y-6">
            {/* <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              Whiteboard
            </h2> */}

            {/* Top Info Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Center: Week Date (full available width) */}
              <div className="flex-1">
                <Card className="w-full h-14 flex items-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                  <CardContent className="w-full h-full px-4 py-0 flex items-center">
                    <span className="text-xl md:text-2xl font-medium text-foreground w-full inline-block text-left">
                      Week of {format(currentWeekStart, "MMMM d, yyyy")}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Countdown Timer */}
              <div className="h-14 flex items-stretch mx-1 md:mx-2">
                <CountdownTimer
                  event={countdownEvent}
                  onSaveEvent={handleSaveCountdownEvent}
                  onUpdateEvent={handleUpdateCountdownEvent}
                  onDeleteEvent={handleDeleteCountdownEvent}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar (Desktop) */}
              <div className="hidden lg:block lg:col-span-3">
                <SidebarWeekly
                  weeklyGoals={weeklyGoals}
                  cadence={weeklyGoalsCadence}
                  onToggleWeeklyGoal={handleToggleWeeklyGoal}
                  onAddWeeklyGoal={handleAddWeeklyGoal}
                  onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
                  onDeleteWeeklyGoal={handleDeleteWeeklyGoal}
                  onCadenceChange={handleCadenceChange}
                  thisWeekItems={thisWeekItems}
                  nextWeekItems={nextWeekItems}
                  onAddLookaheadItem={handleAddLookaheadItem}
                  onUpdateLookaheadItem={handleUpdateLookaheadItem}
                  onDeleteLookaheadItem={handleDeleteLookaheadItem}
                />
              </div>

              {/* Mobile Sidebar */}
              <div className="lg:hidden col-span-1">
                <MobileSidebar
                  weeklyGoals={weeklyGoals}
                  cadence={weeklyGoalsCadence}
                  onToggleWeeklyGoal={handleToggleWeeklyGoal}
                  onAddWeeklyGoal={handleAddWeeklyGoal}
                  onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
                  onDeleteWeeklyGoal={handleDeleteWeeklyGoal}
                  onCadenceChange={handleCadenceChange}
                  thisWeekItems={thisWeekItems}
                  nextWeekItems={nextWeekItems}
                  onAddLookaheadItem={handleAddLookaheadItem}
                  onUpdateLookaheadItem={handleUpdateLookaheadItem}
                  onDeleteLookaheadItem={handleDeleteLookaheadItem}
                />
              </div>

              {/* Main Content - Daily Grid */}
              <div className="lg:col-span-9">
                <DailyGrid
                  weekDates={weekDates}
                  dailyGoals={dailyGoals}
                  dailyFlags={dailyFlags}
                  onToggleGoal={handleToggleDailyGoal}
                  onAddGoal={handleAddDailyGoal}
                  onUpdateGoal={handleUpdateDailyGoal}
                  onDeleteGoal={handleDeleteDailyGoal}
                  onToggleFlag={handleToggleFlag}
                />
              </div>
            </div>

            {/* Goals Heatmap */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-muted/5 border-border/50">
              <GoalsHeatmap goals={allDailyGoals} weekDates={weekDates.map(formatDate)} />
            </Card>
          </section>

          {/* ========== HABITS SECTION ========== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              Habits
            </h2>

            {/* Two-column layout for discipline card and statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisciplineCard
                weekDates={weekDates}
                tracking={disciplineTracking}
                onToggle={handleToggleDiscipline}
              />
              <DisciplineStatisticsCard
                heatmapData={buildDisciplineHeatmapData(getDatesFromStart(), allDisciplineTracking)}
                tracking={allDisciplineTracking}
              />
            </div>

            {/* Discipline Heatmap */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-muted/5 border-border/50">
              <DisciplineHeatmap tracking={allDisciplineTracking} />
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
