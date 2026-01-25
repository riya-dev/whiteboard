-- Migration: Add period_end_date to weekly_goals
-- Date: 2025-01-05

alter table public.weekly_goals
  add column if not exists period_end_date date;

update public.weekly_goals
set period_end_date = period_start_date + (case when cadence = 'weekly' then 6 else 13 end)
where period_end_date is null;
