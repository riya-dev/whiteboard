/**
 * Date utilities for Tuesday-Monday week system
 * All weeks start on Tuesday and end on Monday
 */

export interface HeatmapDay {
  date: string // YYYY-MM-DD format
  intensity: number // 0-4 (GitHub style: 0=none, 1-4=increasing intensity)
  count?: number // Optional: raw count of completed items
  total?: number // Optional: total items for percentage
  metadata?: any // Optional: raw data for detailed tooltips (e.g., discipline tracking)
}

/**
 * Get the Tuesday that starts the week containing the given date
 * @param date - Any date
 * @returns The Tuesday that starts that week
 */
export function getTuesdayWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

  // Calculate days to go back to Tuesday
  let daysBack: number
  if (day === 0) {
    // Sunday - go back 5 days to Tuesday
    daysBack = 5
  } else if (day === 1) {
    // Monday - go back 6 days to last Tuesday
    daysBack = 6
  } else {
    // Tuesday-Saturday - go back to this week's Tuesday
    daysBack = day - 2
  }

  const tuesday = new Date(d)
  tuesday.setDate(d.getDate() - daysBack)
  tuesday.setHours(0, 0, 0, 0)
  return tuesday
}

/**
 * Get all 7 dates for a week starting from a Tuesday
 * @param weekStart - The Tuesday that starts the week
 * @returns Array of 7 dates [Tue, Wed, Thu, Fri, Sat, Sun, Mon]
 */
export function getTuesdayWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    dates.push(date)
  }
  return dates
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
 * @param currentWeekStart - Current Tuesday week start
 * @returns Previous Tuesday
 */
export function getPreviousWeek(currentWeekStart: Date): Date {
  const prevWeek = new Date(currentWeekStart)
  prevWeek.setDate(currentWeekStart.getDate() - 7)
  return prevWeek
}

/**
 * Navigate to next week (7 days forward)
 * @param currentWeekStart - Current Tuesday week start
 * @returns Next Tuesday
 */
export function getNextWeek(currentWeekStart: Date): Date {
  const nextWeek = new Date(currentWeekStart)
  nextWeek.setDate(currentWeekStart.getDate() + 7)
  return nextWeek
}

/**
 * Check if a date falls within a given week
 * @param date - Date to check
 * @param weekStart - Tuesday that starts the week
 * @returns True if date is in the week
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const weekDates = getTuesdayWeekDates(weekStart)
  const dateStr = formatDate(date)
  return weekDates.some((d) => formatDate(d) === dateStr)
}

/**
 * Check if current week is within a biweekly period
 * @param goalPeriodStart - The Tuesday that starts the biweekly period (from database)
 * @param currentWeekStart - The Tuesday of the week being viewed
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
