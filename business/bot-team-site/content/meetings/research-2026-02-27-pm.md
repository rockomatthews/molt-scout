# Research PM — 2026-02-27

## Repo status (brittle / blocked / monetizable)

### Brittle
- **Nested repo showing as untracked:** `business/polymarket-btc-5min/` is its own git repo and includes a local `.env`. In the parent repo it was showing as `??` (easy to accidentally add/commit secrets). I added a top-level `.gitignore` entry to ignore it.
- **alpha-engine hard-fails on paid APIs:** `business/alpha-engine/logs/events.jsonl` shows Neynar requests returning **402 PaymentRequired**. That means features that depend on “trending” are silently degraded unless we either pay or add a fallback.

### Blocked
- **Neynar “trending” access is effectively blocked** unless we upgrade the plan or switch data sources.

### Monetizable next
- We already have a working skeleton for **Base USDC pay-per-action (quote + verify)** in `business/agent-ops-toolkit-site/src/app/api/402/*` plus a first paid endpoint stub (`/api/premium/security-grade`). This is the cleanest path to first revenue because it’s:
  - bounded scope (scan → report)
  - low-risk (no trading keys / no custody)
  - naturally “pay-per-result”

## Two concrete implementation tasks

1) **Turn “Security Grade Lite” into a real paid pipeline (revenue unlock)**
   - Implement automated scans (OSV + `npm audit`, gitleaks, basic Next.js/env/header checks).
   - Return a structured report (JSON + markdown, optional PDF) + signed receipt (nonce) to prevent replay.
   - Add a minimal UI page in agent-ops-toolkit-site to submit `repoUrl`, show quote, and verify + display the report.

2) **Make alpha-engine resilient to data-provider paywalls (reliability unlock)**
   - Add a provider abstraction + feature flags for “trending” sources.
   - Fallback to a free endpoint / cached snapshot when Neynar returns 402.
   - Emit a single high-signal alert (not spam) when a provider is paywalled so we notice quickly.

## New idea logged
- Added a new untriaged queue item: **Pay-per-scan “Security Grade Lite” (x402/USDC)** (Source: Research PM).
