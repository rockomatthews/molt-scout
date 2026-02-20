-- 005_clawn_radar.sql
-- Stores daily picks for "3 launches worth watching" sourced from clawn.ch/pad

create table if not exists public.clawn_radar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  source text not null default 'clawn.ch/pad',
  symbol text not null,
  name text,
  post_url text,
  trade_url text,
  note text,

  day date not null default (now()::date)
);

create index if not exists clawn_radar_day_idx on public.clawn_radar (day desc);
create index if not exists clawn_radar_created_at_idx on public.clawn_radar (created_at desc);
