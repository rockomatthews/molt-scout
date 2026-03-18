#!/usr/bin/env bash
set -euo pipefail

# Run a command with env vars loaded from an env file.
# Usage:
#   ./scripts/run_with_env.sh .secrets/paper-protocol.env -- node scripts/deploy_mainnet.mjs

ENV_FILE=${1:-}
shift || true
if [[ -z "$ENV_FILE" || "${1:-}" != "--" ]]; then
  echo "Usage: $0 <env-file> -- <command...>" >&2
  exit 1
fi
shift

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

exec "$@"