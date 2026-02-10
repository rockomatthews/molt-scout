# Zerion webhooks → Supabase (Vercel)

This is a tiny Vercel/Next.js app that receives Zerion webhooks and stores them in Supabase.

## 1) Create Supabase table
Run this in Supabase SQL editor:

```sql
create table if not exists public.zerion_webhook_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  headers jsonb not null,
  body jsonb not null
);

create index if not exists zerion_webhook_events_received_at_idx
  on public.zerion_webhook_events (received_at desc);
```

## 2) Deploy to Vercel
- Import this folder as a new Vercel project.
- Set environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 3) Configure Zerion webhook
Set Zerion to POST to:
- `https://<your-vercel-domain>/api/zerion`

Health check:
- `GET https://<your-vercel-domain>/api/zerion`

## Notes
- Signature verification is not implemented yet (depends on Zerion’s webhook signature spec).
- This stores raw events; your Mac can poll Supabase and turn them into alerts/trades.
