-- Create users table with Supabase auth integration
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  last_login timestamptz,
  is_active boolean not null default true
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS policies for users
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Admin policy to view all users
create policy "admin_select_all_users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create index for faster queries
create index if not exists users_email_idx on public.users(email);
create index if not exists users_role_idx on public.users(role);
