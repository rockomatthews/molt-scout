#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${BITNET_PORT:-8089}"
MODEL="${BITNET_MODEL:-bitnet2b}"

PROMPT="${BITNET_BENCH_PROMPT:-Write 5 short bullet points about why low-latency local inference matters for autonomous agents.}"
TOKENS="${BITNET_BENCH_TOKENS:-128}"

threads_list=(4 8 12)

if ! curl -s "http://127.0.0.1:${PORT}/v1/models" >/dev/null; then
  echo "BitNet server not responding on :${PORT}. Start it first:" >&2
  echo "  ./scripts/run_server.sh" >&2
  exit 1
fi

echo "threads,total_tokens,elapsed_ms" 

for t in "${threads_list[@]}"; do
  # restart server with new thread count
  if [ -f /tmp/bitnet-server.pid ]; then
    kill -9 "$(cat /tmp/bitnet-server.pid)" >/dev/null 2>&1 || true
    sleep 1
  fi

  BITNET_THREADS="$t" BITNET_PORT="$PORT" nohup "$ROOT/scripts/run_server.sh" > /tmp/bitnet-server.log 2>&1 &
  echo $! > /tmp/bitnet-server.pid

  # wait for model to load
  for i in {1..60}; do
    out=$(curl -s "http://127.0.0.1:${PORT}/v1/models" || true)
    echo "$out" | grep -q "bitnet2b" && break
    sleep 0.5
  done

  start=$(python3 - <<'PY'
import time
print(int(time.time()*1000))
PY
)

  # Fire one completion
  curl -s "http://127.0.0.1:${PORT}/v1/chat/completions" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"system\",\"content\":\"Be concise.\"},{\"role\":\"user\",\"content\":\"${PROMPT}\"}],\"max_tokens\":${TOKENS},\"temperature\":0.3}" \
    >/dev/null

  end=$(python3 - <<'PY'
import time
print(int(time.time()*1000))
PY
)

  elapsed=$((end-start))
  echo "$t,$TOKENS,$elapsed"

done
