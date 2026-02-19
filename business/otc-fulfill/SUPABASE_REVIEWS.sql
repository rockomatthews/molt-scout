-- Reviews table for agenttoolkit.xyz
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
