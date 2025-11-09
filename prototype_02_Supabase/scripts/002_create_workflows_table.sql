-- Create workflows table
create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  cubes jsonb not null default '[]'::jsonb,
  connections jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.workflows enable row level security;

-- RLS policies for workflows
create policy "workflows_select_own"
  on public.workflows for select
  using (auth.uid() = user_id);

create policy "workflows_insert_own"
  on public.workflows for insert
  with check (auth.uid() = user_id);

create policy "workflows_update_own"
  on public.workflows for update
  using (auth.uid() = user_id);

create policy "workflows_delete_own"
  on public.workflows for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index if not exists workflows_user_id_idx on public.workflows(user_id);
create index if not exists workflows_status_idx on public.workflows(status);
create index if not exists workflows_updated_at_idx on public.workflows(updated_at desc);

-- Create function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for auto-updating updated_at
drop trigger if exists workflows_updated_at on public.workflows;
create trigger workflows_updated_at
  before update on public.workflows
  for each row
  execute function public.update_updated_at_column();
