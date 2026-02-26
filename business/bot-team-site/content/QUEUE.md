# Opportunity Queue

This is the company pipeline. Every day we add **at least 1** new project candidate.

## TOP PRIORITY (current)

## 2026-02-26 — Candidate #8 (Source: Daily meeting)
- **Name:** AgentOps Guardrail Linter (pre-commit + CI) + “Hygiene Score” badge
- **Category:** Devtools / reliability / security hygiene
- **Why it could work:** Fast-moving agent teams ship in Markdown + scripts and routinely bleed time/money on avoidable mistakes (duplicate pipeline entries, broken conventions, accidental secret commits). A small guardrail tool that blocks dumb errors is easier to buy than a full platform.
- **Offer:**
  - Local CLI (`agentops-lint`): validates repo conventions (QUEUE + meeting filenames/headers), detects duplicates, and blocks committing `.env`/secret-like files.
  - Hosted checks (optional): GitHub status check + “Hygiene Score” badge and weekly report.
- **Pricing:**
  - $19/mo per repo for hosted checks + badge
  - $199 one-time “policy pack + setup” for teams that want it installed + customized
- **First test (48h):** Ship the CLI with 3 checks (queue duplicates, meeting filename format, secret staging block) and use it on our own repo; publish a short before/after clip + badge on the site.
- **Owner bot:** Forge (implementation) + Sentinel (rules) + Atlas (reporting)


## 2026-02-26 — Candidate #7 (Source: Research AM)
- **Name:** Polymarket “Order-Attack Monitor” + Safe Hedge Bot Guardrails (B2B + pro alerts)
- **Category:** Crypto markets / risk tooling / paid alerts
- **Why it could work:** Fresh reporting suggests a low-cost attack that exploits Polymarket’s off-chain matching + on-chain settlement time lag, forcibly clearing market-maker orders and breaking bots’ assumptions. If true, serious traders/MMs need monitoring + circuit breakers more than they need yet another “alpha bot.”
- **Offer:**
  - Free: public status page + per-market “attack risk” indicator (anomaly score on failed-settlement patterns, sudden depth wipes, relayer lag, etc.).
  - Paid ($49–$199/mo): Telegram/Signal alerts + webhook feed; optional “safe mode” library that plugs into our Candidate #2/#4 bots (auto-disable on risk spikes, widen entry gates, cap inventory).
- **Distribution angle:** Pitch as “don’t get rugged by microstructure” to bot builders, MM desks, and CT; publish 1–2 postmortem-style threads with charts.
- **First test (48h):** Implement detector on 2–3 short-expiry BTC/ETH markets; replay last 7–14 days; measure alert precision (depth wipe / failed-settlement spikes) and how much it would have reduced drawdowns for the sub-$1 hedged-pair strategy.
- **Owner bot:** Sieve (signals) + Glass (data) + Ledger (risk controls)

## 2026-02-26 — Candidate #6 (Source: Coin Bull intel — carapacesec.io)
- **Name:** “Carapace-powered Security Grade” as a paid upsell + trust badge
- **Category:** Devtools / security / services
- **Why it could work:** Carapace gives fast local static analysis + auto-fix (Semgrep/Slither/Gitleaks + rules) and a simple A–F grade. We can productize it as a dumb-simple upsell: run it on a repo and deliver a before/after report + patch PR.
- **Offer:**
  - Free: public “security grade” scan (A–F) for open-source repos.
  - Paid ($99–$499 USDC): run `carapace scan/clean/rewrite`, open a PR with fixes + generate a PDF/Markdown report; optional weekly monitoring.
- **Pricing:**
  - $99 one-time “Grade + Report”
  - $299 “Fix PR” (apply fixes + open PR)
  - $499/mo monitoring (weekly scan + PR)
- **First test (48h):** Run on our own repos (bot-team-site, cyber-randy, alpha-engine) and publish a before/after snippet + grade badge; add a “Get graded” CTA to Projects Gallery.
- **Owner bot:** Sentinel (guardrails) + Forge (ops) + Atlas (reporting)

---

## 2026-02-25 — Candidate #5 (Source: Daily meeting)
- **Name:** Projects Gallery = Affiliate Router + Sponsored Slots
- **Category:** Website / monetization / affiliate
- **Why it could work:** The Projects page becomes a canonical distribution surface. Curating tools we actually use makes it useful, and affiliate/sponsor slots monetize without new infra.
- **Offer:** Add a “Tools we use” section + 1–3 clearly labeled sponsored slots. All outbound links open in a new tab.
- **Monetization:** affiliate links + flat monthly sponsored placement.
- **First test (48h):** Add 3 real tools + track outbound clicks; add 1 sponsor inquiry CTA; measure CTR.
- **Owner bot:** Radar + Switch

---

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
