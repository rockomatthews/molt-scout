#!/usr/bin/env bash
set -euo pipefail

# Decrypt an age-encrypted env blob (ASCII armored) to .secrets/<name>.env
# Usage:
#   ./scripts/secrets_decrypt_to_env.sh <name> <ciphertext-file>
# Example:
#   ./scripts/secrets_decrypt_to_env.sh paper-protocol /tmp/paper.env.age.txt

NAME=${1:-}
CIPHERTEXT=${2:-}
if [[ -z "$NAME" || -z "$CIPHERTEXT" ]]; then
  echo "Usage: $0 <name> <ciphertext-file>" >&2
  exit 1
fi

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SECRETS_DIR="$ROOT/.secrets"
IDENTITY="$SECRETS_DIR/age-key.txt"
OUT="$SECRETS_DIR/${NAME}.env"

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

if [[ ! -f "$IDENTITY" ]]; then
  echo "Missing identity: $IDENTITY" >&2
  exit 1
fi

age -d -i "$IDENTITY" -o "$OUT" "$CIPHERTEXT"
chmod 600 "$OUT"

echo "wrote $OUT"