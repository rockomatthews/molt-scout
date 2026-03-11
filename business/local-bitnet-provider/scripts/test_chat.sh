#!/usr/bin/env bash
set -euo pipefail

PORT="${BITNET_PORT:-8089}"
MODEL="${BITNET_MODEL:-/Users/home/clawd/business/local-bitnet-provider/.models/bitnet/ggml-model-i2_s.gguf}"

curl -s "http://127.0.0.1:${PORT}/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"system\",\"content\":\"You are concise.\"},{\"role\":\"user\",\"content\":\"Say hello and name one advantage of 1-bit models.\"}],\"max_tokens\":80,\"temperature\":0.3}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['choices'][0]['message']['content'])" 2>/dev/null || true
