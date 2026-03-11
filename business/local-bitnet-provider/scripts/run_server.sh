#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${BITNET_PORT:-8089}"
THREADS="${BITNET_THREADS:-8}"

MODEL_DEFAULT="$ROOT/.models/bitnet/ggml-model-i2_s.gguf"
MODEL_PATH="${BITNET_MODEL_PATH:-$MODEL_DEFAULT}"

BIN_DEFAULT="$ROOT/.bin/llama-server"
BIN_PATH="${BITNET_SERVER_BIN:-$BIN_DEFAULT}"

if [ ! -f "$MODEL_PATH" ]; then
  echo "Model not found: $MODEL_PATH" >&2
  echo "Expected: $MODEL_DEFAULT" >&2
  exit 1
fi

if [ ! -x "$BIN_PATH" ]; then
  echo "Server binary not found or not executable: $BIN_PATH" >&2
  echo "Set BITNET_SERVER_BIN to your llama-server binary" >&2
  exit 1
fi

echo "Starting BitNet llama-server" >&2
echo "- bin:   $BIN_PATH" >&2
echo "- model: $MODEL_PATH" >&2
echo "- port:  $PORT" >&2
echo "- threads: $THREADS" >&2

exec "$BIN_PATH" \
  --host 127.0.0.1 \
  --port "$PORT" \
  -m "$MODEL_PATH" \
  -t "$THREADS" \
  -c 2048 \
  --log-disable
