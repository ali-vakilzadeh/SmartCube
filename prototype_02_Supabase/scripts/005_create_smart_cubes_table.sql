-- Create smart_cubes table for reusable cube configurations
create table if not exists public.smart_cubes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  cube_type text not null,
  configuration jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.smart_cubes enable row level security;

-- RLS policies for smart_cubes
create policy "smart_cubes_select_own"
  on public.smart_cubes for select
  using (auth.uid() = user_id or is_public = true);

create policy "smart_cubes_insert_own"
  on public.smart_cubes for insert
  with check (auth.uid() = user_id);

create policy "smart_cubes_update_own"
  on public.smart_cubes for update
  using (auth.uid() = user_id);

create policy "smart_cubes_delete_own"
  on public.smart_cubes for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists smart_cubes_user_id_idx on public.smart_cubes(user_id);
create index if not exists smart_cubes_is_public_idx on public.smart_cubes(is_public);

-- Create trigger for auto-updating updated_at
drop trigger if exists smart_cubes_updated_at on public.smart_cubes;
create trigger smart_cubes_updated_at
  before update on public.smart_cubes
  for each row
  execute function public.update_updated_at_column();
