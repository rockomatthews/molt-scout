-- 001_core.sql

create table if not exists public.alr_users (
  wallet text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.alr_subscriptions (
  wallet text primary key,
  tier text not null,
  status text not null,
  paid_until timestamptz not null,
  last_payment_tx text,
  last_amount_usdc numeric,
  updated_at timestamptz not null default now()
);

create index if not exists alr_subscriptions_paid_until_idx on public.alr_subscriptions (paid_until desc);

create table if not exists public.alr_launches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  symbol text,
  name text,
  post_url text,
  trade_url text,
  raw jsonb
);

create index if not exists alr_launches_created_at_idx on public.alr_launches (created_at desc);

create table if not exists public.alr_daily_picks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day date not null default (now()::date),
  symbol text,
  name text,
  post_url text,
  trade_url text,
  note text,
  score numeric
);

create index if not exists alr_daily_picks_day_idx on public.alr_daily_picks (day desc);
