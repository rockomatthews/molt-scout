#!/usr/bin/env bash
set -euo pipefail

if ! command -v agentcard >/dev/null 2>&1; then
  echo "agentcard CLI not found. Install: npm install -g agentcard" >&2
  exit 1
fi

echo "agentcard CLI present: $(agentcard --version 2>/dev/null || echo ok)"
