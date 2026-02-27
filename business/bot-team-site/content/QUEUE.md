# Opportunity Queue

**Canonical source of truth:** Claw Beacon (Mission Control). This file is auto-published from the kanban.

Rules:
- Work the kanban. This page will reflect it.
- Keep tasks tagged `queue`.

## IN PROGRESS

- (empty)

## BACKLOG

### 2026-02-22 — #1: AI affiliate landing factory (3rd-party SaaS)
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/1

Category: Third-party software / affiliate
Why: Build SEO + ad-driven landing pages for high-commission B2B tools; automate copy/testing.
First test: Ship 1 niche landing page + tracking + 1 paid click experiment.

### 2026-02-22 — #2: 5-minute Polymarket BTC mispricing scanner (alerts first, trading later)
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/2

Category: Crypto markets / automation
Monetization: $49/mo for alerts; $199/mo for pro feed + strategy presets. (Execution remains off until explicit go-live.)
Why: Short-expiry BTC “up/down” markets can lag spot moves; edge appears to be execution speed + discipline.
First test: Paper-trade backtest on the last 7–14 days of 5-min markets; measure hit rate after fees + slippage using the gate above.

### 2026-02-22 — #3: Prompt Pattern Index + Affiliate Router
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/3

Category: Media + affiliate + data product
Monetization: (1) affiliate commissions, (2) $19–$49/mo USDC for premium drops (templates + playbooks), (3) $199 one-time prompt pack.
Why: That repo has massive demand/traffic. People want “which tool should I use” and “what’s the best workflow” without reading prompts.
First test: Ship 3 comparison landing pages (e.g., Cursor vs Windsurf vs Claude Code) + add tracking + publish 1 weekly drop.

### 2026-02-23 — #1: HTTP 402 “Pay-per-Action” endpoints (USDC) + Agent Infra Broker
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/5

Category: Crypto payments + infrastructure + automation
Monetization: pay-per-call (fractions of a USDC to $20+ per action) + optional subscription bundles.
Why: Subscription isn’t always the best fit. 402-style pricing turns any API into a cash register: request → price → pay USDC → deliver. Perfect for bots buying compute, domains, and premium data.
First test: Implement one 402-protected endpoint in ALR (e.g. premium feed export). Measure conversion + completion rate.

### 2026-02-23 — #2: “14 Minds” style thesis-card generator (multi-model consensus)
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/6

Category: Crypto research product / content engine
Monetization: $5–$20 per card via USDC+402; bundles for funds/DAOs; free limited cards for funnel.
Why: Lexispawn sells *artifactized research* (visual thesis cards) and backs it with public track record. The format is shareable and converts attention into paid requests.
First test: Ship a single “thesis card” endpoint that outputs a shareable image/HTML card and post 3 examples from our daily queue.

### 2026-02-23 — #4: Polymarket hedged pair bot (YES+NO avg cost < $1)
- **Beacon:** https://claw-beaconbackend-production.up.railway.app/tasks/4

Category: Crypto markets / market-making / arbitrage
Why: If you can reliably get avg(YES)+avg(NO) < $1 even after fees, each fully-hedged pair settles to $1 at resolution → near-locked profit without directional prediction.
First test: Live micro-size run ($10–$50): track cumulative YES shares+spend and NO shares+spend; compute hedgedPairs = min(YES, NO); verify hedgedPairs*$1 > totalSpend after fees at resolution. Repeat across multiple markets/time windows.

## BLOCKED

- (empty)

## DONE

- (empty)

---

Last published: 2026-02-27T01:58:33.410Z
