-- Cyber Randy: bot reply idempotency mapping
-- Run this in Supabase SQL editor

create table if not exists public.cr_bot_replies (
  message_id uuid primary key references public.cr_messages(id) on delete cascade,
  reply_id uuid not null references public.cr_messages(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.cr_bot_replies enable row level security;

drop policy if exists "cr_bot_replies_read" on public.cr_bot_replies;
create policy "cr_bot_replies_read"
  on public.cr_bot_replies
  for select
  to authenticated
  using (true);

-- No insert/update/delete from clients. Only service role uses it.
