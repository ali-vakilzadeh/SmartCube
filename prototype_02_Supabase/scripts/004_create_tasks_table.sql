-- Create tasks table for AI API task execution
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.executions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  cube_id text not null,
  task_type text not null,
  input_data jsonb not null,
  output_data jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  api_provider text,
  api_model text,
  tokens_used integer,
  cost_usd numeric(10, 6)
);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS policies for tasks
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists tasks_execution_id_idx on public.tasks(execution_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
