-- 003_otc_requests.sql
-- OTC requests (used by /api/otc and fulfillment tooling)

create table if not exists public.otc_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  chain_id int not null,
  payer_wallet text not null,
  receiver_wallet text not null,

  usdc_amount numeric not null,
  usdc_tx_hash text not null unique,

  status text not null default 'pending',

  aot_amount numeric,
  aot_tx_hash text,
  error text
);

create index if not exists otc_requests_created_at_idx on public.otc_requests (created_at desc);
create index if not exists otc_requests_status_idx on public.otc_requests (status);
