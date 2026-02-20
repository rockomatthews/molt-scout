#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   SUPABASE_DB_URL='postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres' \
#     bash business/agent-ops-toolkit/db/scripts/apply_migrations.sh

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "Missing SUPABASE_DB_URL"
  echo "Get it from Supabase -> Project Settings -> Database -> Connection string (URI)."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT/migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install PostgreSQL client tools (e.g. 'brew install libpq' then add to PATH)."
  exit 1
fi

echo "Applying migrations from: $MIG_DIR"

for f in $(ls -1 "$MIG_DIR"/*.sql | sort); do
  echo "==> $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
  echo "OK"
done

echo "All migrations applied."
