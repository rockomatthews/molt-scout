#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/home/clawd/business/alpha-engine"
cd "$ROOT"

DAY=$(node -e "console.log(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Denver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))")

npm run -s replay:ab -- --day "$DAY" --config configs/ab/factors.json --config2 configs/ab/filters_v1.json
