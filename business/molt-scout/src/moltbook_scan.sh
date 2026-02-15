#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTDIR="$ROOT/.firecrawl/moltbook"
mkdir -p "$OUTDIR"

TS="$(date -u +"%Y-%m-%dT%H-%M-%SZ")"
OUT="$OUTDIR/moltbook-${TS}.md"
LATEST="$OUTDIR/latest.md"

# Scrape moltbook homepage (main content only) to markdown
firecrawl scrape "https://www.moltbook.com/" --only-main-content -o "$OUT"

# Update latest snapshot
cp "$OUT" "$LATEST"

echo "WROTE=$OUT"
