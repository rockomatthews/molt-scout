-- 001_waitlist.sql
-- Free airdrop waitlist (Base addresses)

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  wallet text not null unique,
  ip_hash text not null
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
