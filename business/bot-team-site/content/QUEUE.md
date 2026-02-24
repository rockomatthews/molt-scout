# Opportunity Queue

This is the company pipeline. Every day we add **at least 1** new project candidate.

## 2026-02-22 — Candidate #1
- **Name:** AI affiliate landing factory (3rd-party SaaS)
- **Category:** Third-party software / affiliate
- **Why it could work:** Build SEO + ad-driven landing pages for high-commission B2B tools; automate copy/testing.
- **Unit economics (rough):** $50–$200 CPA; target 10–50 conversions/mo per niche page.
- **First test (48h):** Ship 1 niche landing page + tracking + 1 paid click experiment.
- **Owner bot:** Radar

## 2026-02-22 — Candidate #2 (inspired by @0x_Discover)
- **Name:** 5-minute Polymarket BTC mispricing scanner (alerts first, trading later)
- **Category:** Crypto markets / automation
- **Why it could work:** Short-expiry BTC “up/down” markets can lag spot moves; edge appears to be execution speed + discipline.
- **Offer:** Real-time alerts + dashboard that detects lag vs Binance/CoinGecko and highlights entries/exits.
- **Pricing:** $49/mo for alerts; $199/mo for pro feed + strategy presets. (Execution remains off until explicit go-live.)
- **Entry gate (hard):** ignore unless `YES + NO ≤ 0.94` (strong alerts at `≤ 0.92`). Rationale: need ~6%+ theoretical edge pre-fees to survive profit fees + slippage + tail fill risk.
- **First test (48h):** Paper-trade backtest on the last 7–14 days of 5-min markets; measure hit rate after fees + slippage using the gate above.
- **Owner bot:** Sieve (signals) + Ledger (risk controls)

## 2026-02-22 — Candidate #3 (traffic fountain: x1xhlol/system-prompts-and-models-of-ai-tools)
- **Name:** Prompt Pattern Index + Affiliate Router
- **Category:** Media + affiliate + data product
- **Why it could work:** That repo has massive demand/traffic. People want “which tool should I use” and “what’s the best workflow” without reading prompts.
- **Offer:** A public index + weekly summaries of patterns (not copied text) + comparison pages that route to tool signups with tracking.
- **Monetization:** (1) affiliate commissions, (2) $19–$49/mo USDC for premium drops (templates + playbooks), (3) $199 one-time prompt pack.
- **First test (48h):** Ship 3 comparison landing pages (e.g., Cursor vs Windsurf vs Claude Code) + add tracking + publish 1 weekly drop.
- **Owner bot:** Radar (distribution) + Glass (scrape/index) + Sieve (ranking)

## 2026-02-23 — Candidate #4 (Zach)
- **Name:** Polymarket hedged pair bot (YES+NO avg cost < $1)
- **Category:** Crypto markets / market-making / arbitrage
- **What it is:** On short-term binary markets (e.g., 5-min/15-min BTC/ETH up/down), accumulate YES and NO shares such that the *average* combined cost per hedged pair stays below $1. Instant simultaneous fills are rare; the edge comes from opportunistic accumulation during swings.
- **Why it could work:** If you can reliably get avg(YES)+avg(NO) < $1 even after fees, each fully-hedged pair settles to $1 at resolution → near-locked profit without directional prediction.
- **Unit economics (rough):** Target 1–4% per fully-hedged pair after fees; scale is constrained by fill quality, fees, and capital lockup until resolution.
- **Key risks / gotchas:** Fees + spread/slippage; inability to fully hedge before resolution; partial-fill inventory risk; execution latency; size may move book; market rules/settlement timing.
- **First test (48h):** Live micro-size run ($10–$50): track cumulative YES shares+spend and NO shares+spend; compute hedgedPairs = min(YES, NO); verify hedgedPairs*$1 > totalSpend after fees at resolution. Repeat across multiple markets/time windows.
- **Owner bot:** Sieve (signals/execution monitoring) + Ledger (PnL accounting/risk)

## 2026-02-23 — Candidate #1 (inspired by otonix.tech)
- **Name:** HTTP 402 “Pay-per-Action” endpoints (USDC) + Agent Infra Broker
- **Status:** ON HOLD (v1.0 ALR held per founder)
- **Category:** Crypto payments + infrastructure + automation
- **Why it could work:** Subscription isn’t always the best fit. 402-style pricing turns any API into a cash register: request → price → pay USDC → deliver. Perfect for bots buying compute, domains, and premium data.
- **Offer:** A set of paid endpoints (402 responses) for (a) premium Radar queries, (b) posting agent-swarm tasks, (c) “deploy this bot” actions. Each request is priced, paid in USDC on Base, and verified automatically.
- **Monetization:** pay-per-call (fractions of a USDC to $20+ per action) + optional subscription bundles.
- **First test (48h):** Implement one 402-protected endpoint in ALR (e.g. premium feed export). Measure conversion + completion rate.
- **Owner bot:** Ledger (payments/verify) + Forge (ops) + Helix (agent-swarm)

## 2026-02-23 — Candidate #2 (inspired by lexispawn.xyz)
- **Status:** ON HOLD (v1.0 ALR held per founder)

- **Name:** “14 Minds” style thesis-card generator (multi-model consensus)
- **Category:** Crypto research product / content engine
- **Why it could work:** Lexispawn sells *artifactized research* (visual thesis cards) and backs it with public track record. The format is shareable and converts attention into paid requests.
- **Offer:** User pastes a token / market → we generate a 1-page thesis card (bullets + risks + catalysts + onchain links). Optional: compare 3–5 models and show consensus/disagreement.
- **Monetization:** $5–$20 per card via USDC+402; bundles for funds/DAOs; free limited cards for funnel.
- **First test (48h):** Ship a single “thesis card” endpoint that outputs a shareable image/HTML card and post 3 examples from our daily queue.
- **Owner bot:** Glass (sources) + Sieve (structure) + Radar (distribution)

---

Add one new candidate per day.
