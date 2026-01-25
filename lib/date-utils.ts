/**
 * Date utilities for configurable week start (legacy default: Tuesday-Monday)
 */

export interface HeatmapDay {
  date: string // YYYY-MM-DD format
  intensity: number // 0-4 (GitHub style: 0=none, 1-4=increasing intensity)
  count?: number // Optional: raw count of completed items
  total?: number // Optional: total items for percentage
  metadata?: any // Optional: raw data for detailed tooltips (e.g., discipline tracking)
}

/**
 * Get the week start date for the week containing the given date.
 * @param date - Any date
 * @param weekStartDay - Day of week to start on (0=Sun, 1=Mon, ..., 6=Sat)
 * @returns The start date for that week
 */
export function getWeekStart(date: Date, weekStartDay: number): Date {
  const d = new Date(date)
  const day = d.getDay()
  const daysBack = (day - weekStartDay + 7) % 7

  const weekStart = new Date(d)
  weekStart.setDate(d.getDate() - daysBack)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Get the Tuesday that starts the week containing the given date
 * @param date - Any date
 * @returns The Tuesday that starts that week
 */
export function getTuesdayWeekStart(date: Date): Date {
  return getWeekStart(date, 2)
}

/**
 * Get all 7 dates for a week starting from the week start date
 * @param weekStart - The date that starts the week
 * @returns Array of 7 dates from week start through week end
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    dates.push(date)
  }
  return dates
}

/**
 * Get all 7 dates for a week starting from a Tuesday
 * @param weekStart - The Tuesday that starts the week
 * @returns Array of 7 dates [Tue, Wed, Thu, Fri, Sat, Sun, Mon]
 */
export function getTuesdayWeekDates(weekStart: Date): Date[] {
  return getWeekDates(weekStart)
}

/**
 * Format a date as YYYY-MM-DD for database storage
 * @param date - Date to format
 * @returns String in YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Format week start date for display: "Week of Tue, Dec 23 2025"
 * @param weekStart - Tuesday that starts the week
 * @returns Formatted string
 */
export function formatWeekDisplay(weekStart: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }
  return `Week of ${weekStart.toLocaleDateString("en-US", options)}`
}

/**
 * Get uppercase day name: TUESDAY, WEDNESDAY, etc.
 * @param date - Date
 * @returns Uppercase day name
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
}

/**
 * Get short day name: Tue, Wed, etc.
 * @param date - Date
 * @returns Short day name
 */
export function getShortDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

/**
 * Get day number: 1, 2, 3, etc.
 * @param date - Date
 * @returns Day of month as string
 */
export function getDayNumber(date: Date): string {
  return date.getDate().toString()
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

/**
 * Get an array of the last 365 days in YYYY-MM-DD format
 * Used for heatmaps
 * @returns Array of 365 date strings, oldest to newest
 */
export function getLast365Days(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(formatDate(date))
  }
  return dates
}

/**
 * Get dates from December 29th, 2025 to today in YYYY-MM-DD format
 * Used for habits statistics
 * @returns Array of date strings from Dec 29, 2025 to today
 */
export function getDatesFromStart(): string[] {
  const dates: string[] = []
  const startDate = new Date("2025-12-29T00:00:00")
  const today = new Date()

  const currentDate = new Date(startDate)
  while (currentDate <= today) {
    dates.push(formatDate(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * Group heatmap days into weeks (Sunday-Saturday)
 * Used for GitHub-style heatmap layout
 * @param days - Array of heatmap days
 * @returns Array of weeks, each week is an array of days
 */
export function groupHeatmapByWeeks(days: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []

  days.forEach((day, index) => {
    currentWeek.push(day)
    const date = new Date(day.date)

    // If it's Saturday (day 6) or last day, complete the week
    if (date.getDay() === 6 || index === days.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return weeks
}

/**
 * Get month labels for heatmap display
 * Returns months with their week index for positioning
 * @param days - Array of heatmap days
 * @returns Array of {month, weekIndex} objects
 */
export function getMonthLabelsForHeatmap(
  days: HeatmapDay[]
): { month: string; weekIndex: number }[] {
  const labels: { month: string; weekIndex: number }[] = []
  const weeks = groupHeatmapByWeeks(days)

  let lastMonth = ""
  weeks.forEach((week, weekIndex) => {
    if (week.length === 0) return

    const firstDay = new Date(week[0].date)
    const month = firstDay.toLocaleDateString("en-US", { month: "short" })

    if (month !== lastMonth) {
      labels.push({ month, weekIndex })
      lastMonth = month
    }
  })

  return labels
}

/**
 * Get day-of-week labels for heatmap (S, M, T, W, T, F, S)
 * @returns Array of day labels
 */
export function getDayOfWeekLabels(): string[] {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}

/**
 * Navigate to previous week (7 days back)
 * @param currentWeekStart - Current week start
 * @returns Previous week start
 */
export function getPreviousWeek(currentWeekStart: Date): Date {
  const prevWeek = new Date(currentWeekStart)
  prevWeek.setDate(currentWeekStart.getDate() - 7)
  return prevWeek
}

/**
 * Navigate to next week (7 days forward)
 * @param currentWeekStart - Current week start
 * @returns Next week start
 */
export function getNextWeek(currentWeekStart: Date): Date {
  const nextWeek = new Date(currentWeekStart)
  nextWeek.setDate(currentWeekStart.getDate() + 7)
  return nextWeek
}

/**
 * Check if a date falls within a given week
 * @param date - Date to check
 * @param weekStart - Week start date
 * @returns True if date is in the week
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const weekDates = getWeekDates(weekStart)
  const dateStr = formatDate(date)
  return weekDates.some((d) => formatDate(d) === dateStr)
}

/**
 * Check if current week is within a biweekly period
 * @param goalPeriodStart - The start date of the biweekly period (from database)
 * @param currentWeekStart - The week start being viewed
 * @returns True if current week is in week 1 or week 2 of the biweekly period
 */
export function isInBiweeklyPeriod(goalPeriodStart: Date | string, currentWeekStart: Date | string): boolean {
  const periodStart = typeof goalPeriodStart === "string" ? parseDate(goalPeriodStart) : new Date(goalPeriodStart)
  const currentStart = typeof currentWeekStart === "string" ? parseDate(currentWeekStart) : new Date(currentWeekStart)

  // Normalize to midnight
  periodStart.setHours(0, 0, 0, 0)
  currentStart.setHours(0, 0, 0, 0)

  // Calculate difference in days
  const diffMs = currentStart.getTime() - periodStart.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  // Goal is visible if we're in the 14-day period (days 0-13)
  return diffDays >= 0 && diffDays < 14
}

/**
 * Get the Monday that ends a biweekly period
 * @param periodStartTuesday - The Tuesday that starts the biweekly period
 * @returns The Monday that ends the period (13 days after Tuesday)
 */
export function getBiweeklyEndMonday(periodStartTuesday: Date | string): Date {
  const tuesday = typeof periodStartTuesday === "string" ? parseDate(periodStartTuesday) : new Date(periodStartTuesday)
  const monday = new Date(tuesday)
  monday.setDate(tuesday.getDate() + 13) // Tuesday + 13 days = Monday of week 2
  return monday
}

/**
 * Calculate the end date for a goal period based on start date and cadence
 * Weekly: end date is 6 days after start (e.g., Monday to Sunday)
 * Biweekly: end date is 13 days after start (e.g., Monday to Sunday of week 2)
 * @param startDate - The start date of the period
 * @param cadence - "weekly" or "biweekly"
 * @returns The end date of the period
 */
export function calculatePeriodEndDate(startDate: Date | string, cadence: "weekly" | "biweekly"): Date {
  const start = typeof startDate === "string" ? parseDate(startDate) : new Date(startDate)
  const endDate = new Date(start)
  const daysToAdd = cadence === "weekly" ? 6 : 13
  endDate.setDate(start.getDate() + daysToAdd)
  return endDate
}

/**
 * Get all dates in a goal period from start to end
 * @param startDate - The start date of the period
 * @param endDate - The end date of the period
 * @returns Array of dates from start to end (inclusive)
 */
export function getPeriodDates(startDate: Date | string, endDate: Date | string): Date[] {
  const start = typeof startDate === "string" ? parseDate(startDate) : new Date(startDate)
  const end = typeof endDate === "string" ? parseDate(endDate) : new Date(endDate)
  const dates: Date[] = []

  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

/**
 * Check if a date falls within a goal period
 * @param date - Date to check
 * @param periodStart - Start of the goal period
 * @param periodEnd - End of the goal period
 * @returns True if date is within the period (inclusive)
 */
export function isDateInGoalPeriod(date: Date | string, periodStart: Date | string, periodEnd: Date | string): boolean {
  const d = typeof date === "string" ? parseDate(date) : new Date(date)
  const start = typeof periodStart === "string" ? parseDate(periodStart) : new Date(periodStart)
  const end = typeof periodEnd === "string" ? parseDate(periodEnd) : new Date(periodEnd)

  d.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  return d >= start && d <= end
}

/**
 * Format a period date range for display
 * @param startDate - Start date of the period
 * @param endDate - End date of the period
 * @returns Formatted string like "Jan 19 - Jan 25"
 */
export function formatPeriodRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === "string" ? parseDate(startDate) : new Date(startDate)
  const end = typeof endDate === "string" ? parseDate(endDate) : new Date(endDate)

  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return `${startStr} - ${endStr}`
}

/**
 * Format biweekly end date for display
 * @param endMonday - The Monday that ends the biweekly period
 * @returns Formatted string like "Monday, Jan 6"
 */
export function formatBiweeklyEndDate(endMonday: Date): string {
  return endMonday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

/**
 * Parse a date string (YYYY-MM-DD) into a Date object
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr + "T00:00:00")
  return date
}

/**
 * Get ordinal suffix for a day number (st, nd, rd, th)
 * @param day - Day number (1-31)
 * @returns Ordinal suffix
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

/**
 * Format a date string with ordinal day (e.g., "December 30th")
 * Supports both YYYY-MM-DD and YYYY/MM/DD formats
 * @param dateStr - Date string in YYYY-MM-DD or YYYY/MM/DD format
 * @returns Formatted string like "December 30th"
 */
export function formatDateWithOrdinal(dateStr: string): string {
  // Convert slashes to hyphens for consistent parsing
  const normalizedStr = dateStr.replace(/\//g, "-")
  const date = parseDate(normalizedStr)

  const month = date.toLocaleDateString("en-US", { month: "long" })
  const day = date.getDate()
  const ordinal = getOrdinalSuffix(day)

  return `${month} ${day}${ordinal}`
}
