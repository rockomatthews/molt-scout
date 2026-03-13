#!/usr/bin/env bash
set -euo pipefail

AMOUNT="${1:-25}"

if ! command -v agentcard >/dev/null 2>&1; then
  echo "agentcard CLI not found. Install: npm install -g agentcard" >&2
  exit 1
fi

# Create a new card with a hard cap.
agentcard cards create --amount "$AMOUNT"
