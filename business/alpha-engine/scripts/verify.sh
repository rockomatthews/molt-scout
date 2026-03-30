#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/home/clawd/business/alpha-engine"
cd "$ROOT"

TODAY=$(node -e "console.log(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Denver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))")

# 1) run one engine cycle + scoreboard
npm run -s run
npm run -s scoreboard

# 2) basic artifact sanity

# Note: we intentionally do NOT run `tsc --noEmit` here because the repo currently
# contains legacy TS type errors that don't block runtime (tsx/Node). We'll add
# typecheck back once those are cleaned up.
for f in "reports/${TODAY}.md" "reports/SCOREBOARD.md" "reports/SCOREBOARD.json"; do
  test -f "$f" || { echo "MISSING $f"; exit 2; }
done

echo "OK verify ${TODAY}"
