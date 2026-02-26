-- Arcade Game schema (MVP)
-- NOTE: run this in Supabase SQL editor.

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

-- 2) Tile arena state (older prototype; kept for now)
create table if not exists public.arc_game_state (
  id text primary key,
  round_ends_at timestamptz,
  crown_idx int not null,
  tiles jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.arc_game_state (id, crown_idx, tiles)
values (
  'global',
  42,
  jsonb_build_object('owners', jsonb_build_array())
)
on conflict (id) do nothing;

-- 3) Hot Potato game (10 players)
create table if not exists public.arc_hotpotato_players (
  address text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.arc_hotpotato_state (
  id text primary key,
  started_at timestamptz,
  countdown_ends_at timestamptz,
  potato_holder text,
  potato_since timestamptz,
  last_pass_from text,
  last_pass_to text,
  loser text,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.arc_hotpotato_state (id)
values ('global')
on conflict (id) do nothing;

-- RLS
alter table public.arc_profiles enable row level security;
alter table public.arc_game_state enable row level security;
alter table public.arc_hotpotato_players enable row level security;
alter table public.arc_hotpotato_state enable row level security;

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

-- Hot Potato: public read; server-only writes (via service role)
drop policy if exists arc_hotpotato_players_read on public.arc_hotpotato_players;
create policy arc_hotpotato_players_read
  on public.arc_hotpotato_players
  for select
  to anon, authenticated
  using (true);

drop policy if exists arc_hotpotato_state_read on public.arc_hotpotato_state;
create policy arc_hotpotato_state_read
  on public.arc_hotpotato_state
  for select
  to anon, authenticated
  using (true);
