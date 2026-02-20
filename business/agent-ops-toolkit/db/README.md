# Supabase DB scripts (Agent Toolkit)

This folder exists so you can add/modify Supabase tables via **scripts**, not manual clicking.

## Prereqs
- `psql` installed
  - macOS: `brew install libpq` then add `$(brew --prefix libpq)/bin` to PATH

## Apply migrations
1) Get your database URL:
   - Supabase → Project Settings → Database → Connection string → URI

2) Run:
```bash
export SUPABASE_DB_URL='postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres'

bash business/agent-ops-toolkit/db/scripts/apply_migrations.sh
```

## Migrations
- `001_waitlist.sql`
- `002_reviews.sql`
- `003_otc_requests.sql`
- `004_subscriptions.sql`

These are idempotent (`create table if not exists`, etc.).
