#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "Missing SUPABASE_DB_URL"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT/migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found"
  exit 1
fi

for f in $(ls -1 "$MIG_DIR"/*.sql 2>/dev/null | sort); do
  echo "==> $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
  echo "OK"
done
