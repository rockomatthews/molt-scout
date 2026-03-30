#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/home/clawd/business/alpha-engine"
cd "$ROOT"

log_err() {
  mkdir -p logs
  {
    echo
    echo "## $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
    echo "$1"
  } >> logs/cron_errors.md
}

run_step() {
  local label="$1"; shift
  if ! out=$(bash --noprofile --norc -lc "$*" 2>&1); then
    log_err "${label} failed\nCommand: $*\nOutput:\n$out"
    return 1
  fi
  return 0
}

TODAY=$(node -e "console.log(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Denver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))")

run_step "alpha-engine run" "cd $ROOT && npm run -s run"
run_step "alpha-engine scoreboard" "cd $ROOT && npm run -s scoreboard"

# Verify artifacts
for f in "reports/${TODAY}.md" "reports/SCOREBOARD.md" "reports/SCOREBOARD.json"; do
  if [[ ! -f "$f" ]]; then
    log_err "MISSING artifact: $f"
    exit 2
  fi
done

echo "OK artifacts ${TODAY}"
