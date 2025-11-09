-- Create executions table for tracking workflow runs
create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'halted')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  execution_data jsonb,
  results jsonb
);

-- Enable RLS
alter table public.executions enable row level security;

-- RLS policies for executions
create policy "executions_select_own"
  on public.executions for select
  using (auth.uid() = user_id);

create policy "executions_insert_own"
  on public.executions for insert
  with check (auth.uid() = user_id);

create policy "executions_update_own"
  on public.executions for update
  using (auth.uid() = user_id);

create policy "executions_delete_own"
  on public.executions for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists executions_workflow_id_idx on public.executions(workflow_id);
create index if not exists executions_user_id_idx on public.executions(user_id);
create index if not exists executions_status_idx on public.executions(status);
create index if not exists executions_started_at_idx on public.executions(started_at desc);
