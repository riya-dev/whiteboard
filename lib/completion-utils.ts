/**
 * Completion percentage calculators for goals and discipline tracking
 * Used to generate heatmap intensities
 */

import { HeatmapDay } from "./date-utils"

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface DailyGoalData {
  goal_date: string
  is_completed: boolean
}

export interface DisciplineTrackingData {
  track_date: string
  am_checkin: boolean
  pm_checkin: boolean
  set_goals_tomorrow: boolean
}

// =============================================
// INTENSITY CALCULATORS (0-4 scale like GitHub)
// =============================================

/**
 * Calculate intensity (0-4) for a given date based on goals completion
 * Intensity mapping:
 * - 0: No goals or 0% completed
 * - 1: 1-25% completed
 * - 2: 26-50% completed
 * - 3: 51-75% completed
 * - 4: 76-100% completed
 *
 * @param date - Date string (YYYY-MM-DD)
 * @param goals - All daily goals
 * @returns Intensity level 0-4
 */
export function calculateGoalsIntensity(date: string, goals: DailyGoalData[]): number {
  const dayGoals = goals.filter((g) => g.goal_date === date)

  // If no goals exist for this day, return 0 (empty)
  if (dayGoals.length === 0) return 0

  const completedCount = dayGoals.filter((g) => g.is_completed).length
  const percentage = (completedCount / dayGoals.length) * 100

  // Map percentage to 0-4 intensity
  if (percentage === 0) return 0
  if (percentage <= 25) return 1
  if (percentage <= 50) return 2
  if (percentage <= 75) return 3
  return 4
}

/**
 * Calculate intensity (0-4) for a given date based on discipline completion
 * Intensity mapping:
 * - 0: 0/3 completed
 * - 1: 1/3 completed (33%)
 * - 2: 1/3 completed (33%) - same as 1 for smoother gradient
 * - 3: 2/3 completed (67%)
 * - 4: 3/3 completed (100%)
 *
 * @param date - Date string (YYYY-MM-DD)
 * @param tracking - All discipline tracking records
 * @returns Intensity level 0-4
 */
export function calculateDisciplineIntensity(
  date: string,
  tracking: DisciplineTrackingData[]
): number {
  const dayTracking = tracking.find((t) => t.track_date === date)

  // If no tracking exists for this day, return 0
  if (!dayTracking) return 0

  const completedCount = [
    dayTracking.am_checkin,
    dayTracking.pm_checkin,
    dayTracking.set_goals_tomorrow,
  ].filter(Boolean).length

  // Map 0-3 completed to 0-4 intensity
  if (completedCount === 0) return 0
  if (completedCount === 1) return 1
  if (completedCount === 2) return 3
  return 4 // 3/3 completed
}

// =============================================
// PERCENTAGE CALCULATORS
// =============================================

/**
 * Calculate weekly discipline completion percentage
 * Used for "Discipline % this week" indicator
 *
 * @param weekDates - Array of date strings for the week (7 days)
 * @param tracking - All discipline tracking records
 * @returns Percentage (0-100)
 */
export function calculateWeeklyDisciplinePercentage(
  weekDates: string[],
  tracking: DisciplineTrackingData[]
): number {
  let totalItems = 0
  let completedItems = 0

  weekDates.forEach((date) => {
    const dayTracking = tracking.find((t) => t.track_date === date)
    totalItems += 3 // Always 3 items per day

    if (dayTracking) {
      completedItems += [
        dayTracking.am_checkin,
        dayTracking.pm_checkin,
        dayTracking.set_goals_tomorrow,
      ].filter(Boolean).length
    }
  })

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
}

/**
 * Calculate weekly goals completion percentage
 * Used for weekly summary stats
 *
 * @param weekDates - Array of date strings for the week (7 days)
 * @param goals - All daily goals
 * @returns Percentage (0-100)
 */
export function calculateWeeklyGoalsPercentage(
  weekDates: string[],
  goals: DailyGoalData[]
): number {
  const weekGoals = goals.filter((g) => weekDates.includes(g.goal_date))

  if (weekGoals.length === 0) return 0

  const completedCount = weekGoals.filter((g) => g.is_completed).length
  return Math.round((completedCount / weekGoals.length) * 100)
}

// =============================================
// HEATMAP DATA BUILDERS
// =============================================

/**
 * Build heatmap data for goals completion
 * Generates an array of HeatmapDay objects for the past 365 days
 *
 * @param dates - Array of date strings (365 days)
 * @param goals - All daily goals
 * @returns Array of HeatmapDay objects
 */
export function buildGoalsHeatmapData(dates: string[], goals: DailyGoalData[]): HeatmapDay[] {
  return dates.map((date) => {
    const dayGoals = goals.filter((g) => g.goal_date === date)
    const completedCount = dayGoals.filter((g) => g.is_completed).length

    return {
      date,
      intensity: calculateGoalsIntensity(date, goals),
      count: completedCount,
      total: dayGoals.length,
    }
  })
}

/**
 * Build heatmap data for discipline completion
 * Generates an array of HeatmapDay objects for the past 365 days
 *
 * @param dates - Array of date strings (365 days)
 * @param tracking - All discipline tracking records
 * @returns Array of HeatmapDay objects
 */
export function buildDisciplineHeatmapData(
  dates: string[],
  tracking: DisciplineTrackingData[]
): HeatmapDay[] {
  return dates.map((date) => {
    const dayTracking = tracking.find((t) => t.track_date === date)

    let completedCount = 0
    if (dayTracking) {
      completedCount = [
        dayTracking.am_checkin,
        dayTracking.pm_checkin,
        dayTracking.set_goals_tomorrow,
      ].filter(Boolean).length
    }

    return {
      date,
      intensity: calculateDisciplineIntensity(date, tracking),
      count: completedCount,
      total: 3, // Always 3 discipline items
      metadata: dayTracking, // Include raw tracking data for tooltips
    }
  })
}

// =============================================
// STREAK CALCULATORS (BONUS)
// =============================================

/**
 * Calculate current discipline streak (consecutive days with all 3 items completed)
 * @param tracking - All discipline tracking records (sorted by date DESC)
 * @returns Number of consecutive days
 */
export function calculateDisciplineStreak(tracking: DisciplineTrackingData[]): number {
  const sortedTracking = [...tracking].sort((a, b) => b.track_date.localeCompare(a.track_date))

  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0]
    const dayTracking = sortedTracking.find((t) => t.track_date === dateStr)

    if (
      dayTracking &&
      dayTracking.am_checkin &&
      dayTracking.pm_checkin &&
      dayTracking.set_goals_tomorrow
    ) {
      streak++
    } else {
      break
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

/**
 * Calculate current goals streak (consecutive days with at least one goal completed)
 * @param goals - All daily goals (sorted by date DESC)
 * @returns Number of consecutive days
 */
export function calculateGoalsStreak(goals: DailyGoalData[]): number {
  const sortedGoals = [...goals].sort((a, b) => b.goal_date.localeCompare(a.goal_date))

  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0]
    const dayGoals = sortedGoals.filter((g) => g.goal_date === dateStr)

    if (dayGoals.length > 0 && dayGoals.some((g) => g.is_completed)) {
      streak++
    } else {
      break
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

// =============================================
// SUMMARY STATS
// =============================================

/**
 * Get summary stats for a week
 * @param weekDates - Array of date strings for the week
 * @param goals - All daily goals
 * @param tracking - All discipline tracking
 * @returns Summary object
 */
export function getWeeklySummary(
  weekDates: string[],
  goals: DailyGoalData[],
  tracking: DisciplineTrackingData[]
) {
  const weekGoals = goals.filter((g) => weekDates.includes(g.goal_date))
  const completedGoals = weekGoals.filter((g) => g.is_completed).length

  let disciplineCompleted = 0
  weekDates.forEach((date) => {
    const dayTracking = tracking.find((t) => t.track_date === date)
    if (dayTracking) {
      disciplineCompleted += [
        dayTracking.am_checkin,
        dayTracking.pm_checkin,
        dayTracking.set_goals_tomorrow,
      ].filter(Boolean).length
    }
  })

  return {
    totalGoals: weekGoals.length,
    completedGoals,
    goalsPercentage: calculateWeeklyGoalsPercentage(weekDates, goals),
    disciplineCompleted,
    disciplineTotal: 21, // 7 days × 3 items
    disciplinePercentage: calculateWeeklyDisciplinePercentage(weekDates, tracking),
  }
}

// =============================================
// OVERALL STATISTICS (365 DAYS)
// =============================================

/**
 * Calculate overall goals statistics from heatmap data
 * Used for statistics card display
 * @param heatmapData - Array of HeatmapDay objects
 * @returns Statistics object with total, completed, and percentage
 */
export function calculateGoalsStatistics(heatmapData: HeatmapDay[]): {
  totalGoals: number
  completedGoals: number
  percentage: number
} {
  let totalGoals = 0
  let completedGoals = 0

  heatmapData.forEach((day) => {
    if (day.total !== undefined) {
      totalGoals += day.total
    }
    if (day.count !== undefined) {
      completedGoals += day.count
    }
  })

  const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return {
    totalGoals,
    completedGoals,
    percentage,
  }
}

/**
 * Calculate overall discipline statistics from tracking data
 * Used for statistics card display
 * @param heatmapData - Array of HeatmapDay objects (for structure)
 * @param tracking - All discipline tracking records
 * @returns Statistics object with breakdown by habit type
 */
export function calculateDisciplineStatistics(
  heatmapData: HeatmapDay[],
  tracking: DisciplineTrackingData[]
): {
  amCheckin: { completed: number; total: number; percentage: number }
  pmCheckin: { completed: number; total: number; percentage: number }
  setGoalsTomorrow: { completed: number; total: number; percentage: number }
} {
  let amCompleted = 0
  let pmCompleted = 0
  let setGoalsCompleted = 0

  tracking.forEach((day) => {
    if (day.am_checkin) amCompleted++
    if (day.pm_checkin) pmCompleted++
    if (day.set_goals_tomorrow) setGoalsCompleted++
  })

  const total = heatmapData.length // Total days (365)

  return {
    amCheckin: {
      completed: amCompleted,
      total,
      percentage: total > 0 ? Math.round((amCompleted / total) * 100) : 0,
    },
    pmCheckin: {
      completed: pmCompleted,
      total,
      percentage: total > 0 ? Math.round((pmCompleted / total) * 100) : 0,
    },
    setGoalsTomorrow: {
      completed: setGoalsCompleted,
      total,
      percentage: total > 0 ? Math.round((setGoalsCompleted / total) * 100) : 0,
    },
  }
}
