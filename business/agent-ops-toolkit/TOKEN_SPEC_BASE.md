# AOT Utility Token (Base) — Spec (Draft)

Status: **design + MVP gating** only. No onchain deploy until explicit go-live.

## Audience / positioning
This token is for **OpenClaw / Molt agent builders**.

Core pitch: *Own access to the reliability layer.* If you run agents in production, you need webhooks, retries, queues, budgets, and observability. AOT token gates premium templates + provides a clear sink tied to subscriptions.

## Goals
- Real utility: token gates access to premium toolkit + community + updates.
- Value link: more paying users → more token demand via buybacks/fees.
- Safety: avoid “number go up” promises; token exists to access utility.

## Token basics (proposed defaults)
- Chain: **Base** (8453)
- Standard: ERC-20
- Name: Agent Ops Toolkit
- Symbol: AOT (placeholder)
- Supply: **100,000,000** fixed (no inflation) (placeholder)

### Distribution (placeholder; tune later)
- 50% Community + ecosystem incentives (airdrop/quests/partner grants)
- 20% Treasury (multisig)
- 20% Team (vesting)
- 10% Liquidity + market ops

## Utility mechanics
### 1) Token-gated access (primary)
Holding thresholds unlock tiers:
- **Pro**: >= 100,000 AOT (placeholder)
- **Teams**: >= 1,000,000 AOT (placeholder)

Unlocked assets:
- premium templates repo access (or signed download links)
- new template drops
- premium integrations (Zerion/Stripe-style verification, queues, budget guards)
- “reliability playbook” runbooks

### 2) Subscription-to-token flywheel (cashflow link)
Users can either:
- Hold tokens to unlock access, OR
- Pay fiat subscription.

Rule: allocate a fixed % of subscription revenue to:
- **buybacks** of AOT on Base, then
- either burn or treasury staking rewards.

This ties “more subscribers” to “more token demand”.

### 3) Reputation / verification (optional phase 2)
- Builders can stake tokens to publish verified run logs (signed event logs) to earn a badge.
- Bad behavior can forfeit stake (only if we can define objective rules; otherwise keep it non-custodial/badge-only).

## MVP we will build now (website)
- Next.js site adds a **"Token Gate"** page:
  - connect wallet
  - read Base ERC-20 balance for AOT token address (once deployed)
  - if balance >= threshold: show Pro downloads + docs
  - else: show how to acquire / subscribe

## What we need before deploy
- final name/symbol
- final thresholds (Pro/Teams)
- legal language (no investment promises)
- multisig addresses
- deploy plan + liquidity plan
