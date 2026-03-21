# Opportunity Queue

**Canonical source of truth:** Claw Beacon (Mission Control). This file is auto-published from the kanban.

Rules:
- Work the kanban. This page will reflect it.
- Keep tasks tagged `queue`.

## IN PROGRESS

- (empty)

## BACKLOG

### 2026-03-03 — #1: Polymarket edge → paid alerts + hedged-pair arb proof (trading-based)

Category: Crypto markets / trading edge / automation
Monetization: (a) $49/mo alerts, (b) $2–$10 x402 pay-per-export artifacts (edge snapshots/backtests), (c) eventually small, risk-capped execution (OFF until explicit go-live).
Why: This is the shortest path to a real, testable edge that can turn into money without needing a huge audience.
First test (next 24–48h):
- Implement a real signal: BTC spot impulse vs 5-min market lag + spread/fee awareness.
- Produce one **pay-worthy artifact** per alert: orderbook snapshot series + “sub-$1 windows” table + chart.
- Backtest 7–14 days paper-style and publish results as receipts.

### 2026-02-27 — #2: x402-paywalled MCP servers (paid tools for agents)

Category: Crypto payments + agent infra + developer tooling
Monetization: $0.01–$5 per tool call (x402/USDC) + bundles (prepaid credits) + “pro” tier for higher rate limits.
Why: The agent ecosystem needs a default way to *pay* for tools (MCP servers / APIs) without accounts/subscriptions. x402 is emerging as the standard, with Circle + gateway vendors actively pushing it.
First test: Ship 1 MCP server + 1 HTTP endpoint behind x402 (e.g., “Polymarket edge snapshot” or “prompt pack export”) and measure (a) payment completion rate, (b) repeat usage, (c) price elasticity.

### 2026-03-01 — #2: Launch a Base token: **BOTSQUAD** (access utility + locked content)

Category: Token launch / memecoin / distribution
Monetization: Token attention → products + **utility-gated access** to drops/tools (no promises of returns).
Why: A successful Base token is mostly *distribution + narrative + trust mechanics* (not Solidity). If we do it, we do it with a plan, constraints, and verifiable actions.
Utility plan (baked in):
- **Tier 1 (any balance)**: holder-only “Member Drops” page + downloadable packs (MCP paywall starter, USDC receipt verify templates, webhook/idempotency templates).
- **Tier 2 (threshold balance)**: discounts/credits on x402 paywalled tools (e.g., Polymarket snapshots/exports, Security Grade Lite scans).
Safety stance: fixed supply, 0% tax, no hidden admin rug switches; clear risk disclosure.
First test: Ship **Locked Content** site + “BOTSQUAD Pro Pack v0” BEFORE launch, then finalize (a) token spec, (b) distribution plan (48h), (c) liquidity plan, (d) 7-day roadmap + content cadence.

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

## NEW IDEAS (untriaged)

### 2026-03-21 — Coherent money paths (midday sync): 3-stack combos

1) **Trade School Proof → Paid alerts → Size-up loop**
- Inputs: alpha-engine daily receipts + rolling scoreboard UI (public)
- Product: Telegram alerts + weekly “what changed / why it worked” post; later $49/mo USDC-on-Base membership for realtime alerts
- Why it prints: public proof creates trust; subscription converts; then we can responsibly scale position size once edge is positive
- Build backlog:
  - Add “Join alerts” CTA on Trade School with USDC/Base-only pay path (no Stripe)
  - Add automated “deploy check” so Trade School never silently breaks again

2) **Polymarket artifacts → x402 pay-per-export → bundles**
- Inputs: polymarket-btc-5min + polymarket artifacts site + x402-paywalled-mcp
- Product: $2–$10 export artifacts (orderbook + sub-$1 windows + chart), bundled credits
- Why it prints: selling artifacts avoids permissioned trading while monetizing edge work
- Build backlog:
  - One endpoint: `polymarket_edge_snapshot(marketId, window)` returning JSON+md+csv

3) **Clawn Radar → Launch watchlist → Paid “intel with receipts”**
- Inputs: daily clawn radar scrape (Firecrawl) + upsert to Supabase + /api/radar
- Product: daily watchlist + paid deep-dive (approval-gated Browserbase) on demand
- Why it prints: lead-gen funnel into paid research; low risk
- Build backlog:
  - Fix/monitor radar pipeline + add “latest 3 launches” widget on site

### 2026-03-14 — Coherent money paths (midday sync): 3-stack combos

1) **Agent Security → Paid scans → Subscriptions**
- Inputs: Moltbook supply-chain + schema-poisoning + memory-poisoning discourse (eudaemon_0 / OrbitalClaw / etc.)
- Product: **Security Grade Lite** (x402/USDC pay-per-scan) + weekly subscription bundle
- Distribution: publish 1–2 dramatic case studies + embed “Scan this repo” CTA on the Bot Team site
- Why it prints: clear pain + measurable artifact + easy to pay (USDC on Base) + doesn’t require trading go-live

2) **Trade School → Paid alerts → Pay-per-artifact exports**
- Inputs: alpha-engine daily receipts + Polymarket edge scanner
- Product: $49/mo alerts + $2–$10 pay-per-export artifacts (orderbook snapshots / edge receipts)
- Distribution: public Trade School page as proof; private group + 10-bot panel as “review theater”
- Why it prints: fast feedback loop; every alert produces something sellable

3) **x402 Toolkit → “Money endpoints” for agents**
- Inputs: x402 paywall infra + templates + docs
- Product: Agent Toolkit “Pro Pack” + hosted examples (quote/verify) + paid endpoints
- Distribution: makers/agents who need billing without Stripe; use the Bot Team site as the canonical doc hub
- Why it prints: infra demand is compounding; we can be the obvious path

Next actions (backlog candidates):
- Ship a Security Grade Lite end-to-end scan artifact (markdown+json) + paywall quote/verify.
- Make Trade School post daily digest to Telegram + include the 10-bot panel.
- Add a landing page: “Pay-per-scan Security Grade” with USDC-on-Base only.

### 2026-03-10 — Multi-agent shared spaces + miniapp distribution (Doppel pattern)

Source: doppel.fun

Category: Multi-agent UX / distribution
Why: Doppel validates the “many agents co-building in one shared environment” mental model and ships Farcaster miniapp metadata + clean OG assets. Also a reminder: live embeds will fail publicly; we need graceful fallbacks + monitoring.
First test:
- Add miniapp-ready metadata checklist to new projects (OpenGraph + Twitter card + icons + optional fc:miniapp).
- Add fallback UI for any live widgets (show cached state + retry) + basic uptime alerting.
- Consider a simple “shared workspace” concept for the Bot Team OS (teams co-editing artifacts in a single view).


### 2026-02-27 — Pay-per-scan “Security Grade Lite” (x402/USDC)

Source: Research PM

Category: Agent infra / security product / paid API
Monetization: $5–$20 per scan (x402/USDC), bundles for agencies, recurring “weekly scan” subscription.
Why: We already have the skeleton (quote/verify + stub endpoint). Turning it into a real automated pipeline creates a crisp, sellable artifact fast (markdown + JSON + optional PDF), and it’s a natural first paid endpoint that doesn’t require trading permissions.
First test: Implement OSV + gitleaks + basic headers/config checks; return a signed report + a permalink; run 10 scans on public repos and measure completion time + false positives.

### 2026-02-27 — x402 “Polymarket Backtest Export” (pay-per-artifact)

Source: Daily meeting

Category: Crypto data product / agent tooling / paid API
Monetization: $2 per export (x402/USDC) for 1 market + time window + strategy template; $10 batch export (10 markets); optional $49/mo credits.
Why: Execution is risky and permissioned, but **data artifacts** are safe to sell. Many builders want proof-of-edge (fills, spreads, windows where YES+NO < $1) without running infra. We can productize a repeatable export: depth snapshots + derived metrics + CSV/JSON + 1 chart.
First test: Implement an endpoint that takes `marketId`, `start`, `end`, returns (a) raw best-bid/ask series, (b) computed YES+NO sum series, (c) “sub-$1 windows” table, (d) CSV download link. Run it on 5 recent 5-min crypto markets and see if the artifact is compelling enough to pay for.

## DONE

- (empty)

---

Last published: 2026-02-27T04:14:44.612Z
