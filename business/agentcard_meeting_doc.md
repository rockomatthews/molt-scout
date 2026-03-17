# Alchemy AgentCard meeting — proposal (Bot Team / Rob)

## One-liner
**AgentCard is our approval-gated spend rail for “Intel With Receipts.”** The agent produces a free baseline brief, then (only when it materially improves correctness) asks for approval to buy the missing 10% (Browserbase sessions + paid intel) and returns a cited report with screenshots.

## Why AgentCard helps (plain English)
- Trading bots lose money from **bad info** (rug teams, fake volume, wrong prices) and **flaky collection** (JS sites, logins, rate limits).
- AgentCard lets the agent **buy reliability + high-signal data** at the moment it’s needed.
- Hard guardrail: **no spending without explicit APPROVE**.

## Budget / scope
- **$50/month cap (initial)**
- Phase 1 focuses on **Browserbase reliability** (fastest ROI). Phase 2 adds one paid onchain intel provider.

## “Very good intel” deliverable (what we output)
A daily and on-demand artifact that is:
- **Sourced** (links + timestamps)
- **Evidenced** (screenshots of key claims)
- **Actionable** (watchlist + veto list + “what changes my mind”)

Example outputs:
- **Token/team dossier**: deployer history, liquidity state, holder concentration, known wallet labels, prior launches.
- **Catalyst delta**: what changed in last 24h (listings, contract changes, governance, exploits, narrative spikes).
- **Trade veto**: “do not trade” list with reasons + evidence.

## Demo script (3 minutes)
### Step 1 — Free baseline
User: “Investigate TOKEN_X (Base) — is it legit? should we trade it?”
Agent returns free baseline:
- contract basics, liquidity/volume snapshot, social footprint, obvious red flags
- **confidence + open questions**

### Step 2 — Spend proposal (AgentCard moment)
Agent: “To answer decisively, I propose spending $0.75 on Browserbase to log into X + capture screenshots of (A) token holders page, (B) deployer tx history, (C) LP state. Expected improvement: confirm/no-confirm coordinated wallets + prove evidence. **Approve?**”

### Step 3 — Paid upgrade + receipts
After approval, agent returns:
- “Here is the updated verdict”
- screenshots attached + links
- structured recommendation: trade / watch / veto

## Where Browserbase fits (requirement match)
Browserbase is the reliability layer for:
- JS-heavy dashboards and explorers
- login-gated pages
- screenshot receipts
- repeatable scheduled checks

## How this plugs into the trading engine (alpha-engine)
- The intel pipeline writes two artifacts that directly affect PnL:
  1) **Veto list** (hard block entries)
  2) **Watchlist** (prioritized entries w/ catalyst + confirmation)
- Alpha-engine consumes these as filters/scoring modifiers.

## Phase plan
### Phase 1 (week 1): Browserbase + receipts
- Build “Intel With Receipts” workflow
- Produce 1 daily brief + 3 on-demand deep dives
- Track: time saved, % of candidates vetoed, false-positive reduction

### Phase 2 (week 2–3): add one paid onchain intel provider
Goal: wallet labeling / cluster graph / entity history.
- Agent proposes a single subscription or pay-per-report source
- Only one provider at first (avoid tool sprawl)

## Guardrails (important to Alchemy)
- Explicit **APPROVE** gate for every spend
- Spend cap enforced ($50/mo)
- No private keys in chat; no automated live trading without explicit go-live

## Success metrics (how we know it works)
- **Fewer bad entries** (reduced stop-loss hits; higher win rate)
- **Higher-quality entries** (better expectancy)
- **Operator trust** (every claim has a receipt)
- **Time saved** per investigation

---

## Notes / asks for Alchemy
- Best practice for enforcing monthly caps + per-transaction approvals
- Recommended UX pattern for “preview → approve → deliverable”
- Any preferred integration reference architectures / webhooks
