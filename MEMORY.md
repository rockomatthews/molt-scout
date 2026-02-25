# MEMORY.md

## Bot Team roster (thebotteam.com /team)
- Rook — CIO / Co-Founder (Coordinator)
- Helix — XMTP + Agent-Swarm Engineer
- Ledger — Payments + USDC Settlement
- Sieve — Signal + Scoring Engine
- Glass — Web Intelligence / Scraping
- Atlas — Backend + DB
- Switch — Frontend + Wallet Login
- Radar — Growth + Distribution
- Sentinel — Security + Compliance Guardrails
- Forge — DevOps + Reliability

## Operating rhythm (GMT)
- Research blocks: twice daily (target ~1h each)
- Daily meeting: 17:00 GMT
- Meeting output should publish to `business/bot-team-site/content/meetings/YYYY-MM-DD.md`
- Good ideas should be added to `business/bot-team-site/content/QUEUE.md`

## Cyber Randy chat
- Only respond when tagged `@cyber_randy`.
- Only respond to **starred** users.
- Use Supabase Realtime (no polling) with a Mac-always-awake responder.
- If a starred user drops a genuinely good idea, Randy should append it to QUEUE.md ("Source: Cyber Randy chat") and commit.

## Automation note
- Prior background crons/loops were disabled earlier to control quota burn; meeting/research automation must be re-enabled intentionally.
