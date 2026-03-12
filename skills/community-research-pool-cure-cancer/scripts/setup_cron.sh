#!/usr/bin/env bash
set -euo pipefail

# Adds a daily OpenClaw cron job that runs the community research loop.
# Requires: openclaw CLI configured + CRP_SITE_URL + CRP_WRITE_TOKEN exported.

NAME="Community Research Pool: cure-cancer (daily 60m)"
TZ="${CRP_CRON_TZ:-America/Denver}"
CRON_EXPR="${CRP_CRON_EXPR:-0 8 * * *}"

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw CLI not found. Install OpenClaw and ensure 'openclaw' is on PATH." >&2
  exit 1
fi

if [ -z "${CRP_SITE_URL:-}" ]; then
  echo "Missing env: CRP_SITE_URL" >&2
  exit 1
fi

if [ -z "${CRP_WRITE_TOKEN:-}" ]; then
  echo "Missing env: CRP_WRITE_TOKEN" >&2
  exit 1
fi

MESSAGE=$(cat <<EOF
Run the Community Research Pool daily loop for topic cure-cancer.

Rules:
- Research-only, not medical advice.
- Every finding must cite sources.

Steps:
1) Read yesterday’s digest from ${CRP_SITE_URL} (avoid redundancy).
2) Research for ~60 minutes focused on NEW deltas toward SOLVED Milestone B.
3) POST deltas to ${CRP_SITE_URL}/api/push using CRP_WRITE_TOKEN.

Output: short summary + links.
EOF
)

openclaw cron add \
  --name "$NAME" \
  --cron "$CRON_EXPR" \
  --tz "$TZ" \
  --session isolated \
  --message "$MESSAGE" \
  --deliver

echo "Installed cron job: $NAME"
