#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cp config.json config.json.bak.before-okx-fast
cp configs/ab/okx_fast.json config.json
node -e "JSON.parse(require('fs').readFileSync('config.json','utf8')); console.log('ok')" >/dev/null

echo "Switched config.json -> okx_fast (backup: config.json.bak.before-okx-fast)"
