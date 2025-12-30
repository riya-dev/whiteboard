-- Migration: Rebuild Weekly Dashboard Schema
-- Adds: weekly_goals, lookahead tables
-- Modifies: discipline_tracking table structure
-- Date: 2025-12-29

-- =============================================
-- 1. CREATE WEEKLY_GOALS TABLE
-- =============================================

create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  period_start_date date not null, -- Tuesday of the week or biweek period
  cadence text not null check (cadence in ('weekly', 'biweekly')),
  goal_text text not null,
  is_completed boolean default false,
  goal_order integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.weekly_goals enable row level security;

create policy "weekly_goals_all_own"
  on public.weekly_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists weekly_goals_user_period_idx
  on public.weekly_goals(user_id, period_start_date);

create index if not exists weekly_goals_user_cadence_idx
  on public.weekly_goals(user_id, cadence);

-- =============================================
-- 2. CREATE LOOKAHEAD TABLE
-- =============================================

create table if not exists public.lookahead (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start_date date not null, -- Tuesday of the week
  this_week_text text default '',
  next_week_text text default '',
  learnings_text text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, week_start_date)
);

alter table public.lookahead enable row level security;

create policy "lookahead_all_own"
  on public.lookahead for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists lookahead_user_week_idx
  on public.lookahead(user_id, week_start_date);

-- =============================================
-- 3. BACKUP OLD DISCIPLINE_TRACKING (OPTIONAL)
-- =============================================

-- Uncomment if you want to preserve old discipline data
-- create table if not exists discipline_tracking_backup as
-- select * from discipline_tracking;

-- =============================================
-- 4. REPLACE DISCIPLINE_TRACKING TABLE
-- =============================================

-- Drop the old table and recreate with new structure
drop table if exists public.discipline_tracking cascade;

create table public.discipline_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  track_date date not null,
  am_checkin boolean default false,
  pm_checkin boolean default false,
  set_goals_tomorrow boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, track_date)
);

alter table public.discipline_tracking enable row level security;

create policy "discipline_tracking_all_own"
  on public.discipline_tracking for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists discipline_tracking_user_date_idx
  on public.discipline_tracking(user_id, track_date);

-- =============================================
-- 5. CREATE UPDATED_AT TRIGGERS
-- =============================================

-- Function to update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for weekly_goals
drop trigger if exists update_weekly_goals_updated_at on weekly_goals;
create trigger update_weekly_goals_updated_at
  before update on weekly_goals
  for each row
  execute function update_updated_at_column();

-- Trigger for lookahead
drop trigger if exists update_lookahead_updated_at on lookahead;
create trigger update_lookahead_updated_at
  before update on lookahead
  for each row
  execute function update_updated_at_column();

-- Trigger for discipline_tracking
drop trigger if exists update_discipline_tracking_updated_at on discipline_tracking;
create trigger update_discipline_tracking_updated_at
  before update on discipline_tracking
  for each row
  execute function update_updated_at_column();

-- =============================================
-- 6. VERIFY MIGRATION
-- =============================================

-- Check that all tables exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'weekly_goals') then
    raise exception 'weekly_goals table was not created';
  end if;

  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'lookahead') then
    raise exception 'lookahead table was not created';
  end if;

  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'discipline_tracking') then
    raise exception 'discipline_tracking table was not created';
  end if;

  raise notice 'Migration completed successfully!';
end $$;
