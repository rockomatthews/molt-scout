-- Arcade Game schema (MVP)

-- 1) Profiles keyed by wallet address
create table if not exists public.arc_profiles (
  address text primary key,
  username text not null,
  avatar_seed text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enforce unique usernames (case-insensitive)
create unique index if not exists arc_profiles_username_unique
  on public.arc_profiles (lower(username));

-- 2) Single global game state row (simple MVP)
create table if not exists public.arc_game_state (
  id text primary key,
  round_ends_at timestamptz,
  crown_idx int not null,
  tiles jsonb not null,
  updated_at timestamptz not null default now()
);

-- seed global row if missing
insert into public.arc_game_state (id, crown_idx, tiles)
values (
  'global',
  42,
  jsonb_build_object('owners', jsonb_build_array())
)
on conflict (id) do nothing;

-- RLS
alter table public.arc_profiles enable row level security;
alter table public.arc_game_state enable row level security;

-- Profiles: anyone can read (MVP; tighten later)
drop policy if exists arc_profiles_read on public.arc_profiles;
create policy arc_profiles_read
  on public.arc_profiles
  for select
  to anon, authenticated
  using (true);

-- No client-side insert/update in MVP; use server routes with service role.

-- Game state: anyone can read; updates currently allowed from clients (MVP; tighten later)
drop policy if exists arc_game_state_read on public.arc_game_state;
create policy arc_game_state_read
  on public.arc_game_state
  for select
  to anon, authenticated
  using (true);

drop policy if exists arc_game_state_update on public.arc_game_state;
create policy arc_game_state_update
  on public.arc_game_state
  for update
  to anon, authenticated
  using (true)
  with check (true);
