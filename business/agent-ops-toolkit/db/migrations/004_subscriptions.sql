-- 004_subscriptions.sql
-- USDC-only subscriptions (offchain access control for updates)

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  wallet text not null unique,
  tier text not null,
  status text not null,
  paid_until timestamptz not null,

  last_payment_tx text,
  last_amount_usdc numeric,
  notes text
);

create index if not exists subscriptions_paid_until_idx on public.subscriptions (paid_until desc);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
