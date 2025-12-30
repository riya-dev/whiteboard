-- Create lookahead items table for list-based this week / next week
create table if not exists public.lookahead_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start_date date not null, -- Tuesday of the week
  section_type text not null, -- 'this_week' or 'next_week'
  item_text text not null,
  item_order integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint valid_section_type check (section_type in ('this_week', 'next_week'))
);

alter table public.lookahead_items enable row level security;

create policy "lookahead_items_all_own"
  on public.lookahead_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create index for performance
create index if not exists lookahead_items_user_week_idx
  on public.lookahead_items(user_id, week_start_date);

-- Create updated_at trigger for lookahead_items
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lookahead_items_updated_at on public.lookahead_items;

create trigger lookahead_items_updated_at
  before update on public.lookahead_items
  for each row
  execute function public.update_updated_at_column();

-- Drop unused columns from lookahead table (keeping only learnings)
alter table public.lookahead
  drop column if exists this_week_text,
  drop column if exists next_week_text;
