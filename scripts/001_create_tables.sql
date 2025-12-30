-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create daily goals table
create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_date date not null,
  goal_text text not null,
  is_completed boolean default false,
  goal_order integer not null, -- 1, 2, or 3 for the three daily goals
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.daily_goals enable row level security;

create policy "daily_goals_all_own"
  on public.daily_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create disciplines/habits table
create table if not exists public.disciplines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  discipline_name text not null,
  color text default '#ffc0cb', -- soft pink default
  created_at timestamp with time zone default now()
);

alter table public.disciplines enable row level security;

create policy "disciplines_all_own"
  on public.disciplines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create discipline tracking table (for heatmap)
create table if not exists public.discipline_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  discipline_id uuid references public.disciplines(id) on delete cascade not null,
  track_date date not null,
  is_completed boolean default false,
  created_at timestamp with time zone default now(),
  unique(user_id, discipline_id, track_date)
);

alter table public.discipline_tracking enable row level security;

create policy "discipline_tracking_all_own"
  on public.discipline_tracking for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create indexes for performance
create index if not exists daily_goals_user_date_idx on public.daily_goals(user_id, goal_date);
create index if not exists discipline_tracking_user_date_idx on public.discipline_tracking(user_id, track_date);
create index if not exists disciplines_user_idx on public.disciplines(user_id);
