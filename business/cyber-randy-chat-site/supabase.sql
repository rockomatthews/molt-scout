-- Cyber Randy chat schema (run in Supabase SQL editor)

create table if not exists public.cr_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  handle text not null,
  starred boolean not null default false
);

create table if not exists public.cr_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  body text not null
);

alter table public.cr_messages enable row level security;
alter table public.cr_profiles enable row level security;

-- Profiles: user can read all profiles (for sidebar)
create policy if not exists "profiles_read" on public.cr_profiles
for select using (true);

-- Profiles: user can insert/update own profile
create policy if not exists "profiles_insert_own" on public.cr_profiles
for insert with check (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.cr_profiles
for update using (auth.uid() = id);

-- Messages: everyone logged in can read
create policy if not exists "messages_read" on public.cr_messages
for select using (auth.uid() is not null);

-- Messages: user can insert
create policy if not exists "messages_insert" on public.cr_messages
for insert with check (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.cr_messages;
