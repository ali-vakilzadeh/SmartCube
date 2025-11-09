-- Create analytics table for tracking user behavior and system usage
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.analytics enable row level security;

-- RLS policies for analytics
create policy "analytics_select_own"
  on public.analytics for select
  using (auth.uid() = user_id);

create policy "analytics_insert_own"
  on public.analytics for insert
  with check (auth.uid() = user_id);

-- Admin policy to view all analytics
create policy "admin_select_all_analytics"
  on public.analytics for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes
create index if not exists analytics_user_id_idx on public.analytics(user_id);
create index if not exists analytics_event_type_idx on public.analytics(event_type);
create index if not exists analytics_created_at_idx on public.analytics(created_at desc);
