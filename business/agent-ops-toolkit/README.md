# Agent Ops Toolkit (AOT)

A premium, production-grade toolkit for running AI agents **reliably and cheaply**.

Positioning: not “another agent framework”. AOT is the **operational layer**: webhooks, retries, queues, budgets, observability, and on-call style alerting.

This folder contains product/spec docs. The marketing website lives in `../agent-ops-toolkit-site/`.

## Principles
- Deterministic first: most value comes from **rules + plumbing**, not “more LLM”.
- Cost-aware by default: budgets, rate-limits, batching, caching.
- Webhook-native: signature verification, idempotency, replay protection.
- DRY_RUN / safe-mode patterns.

## MVP (Phase 1)
- Templates:
  - Next.js webhook receiver with signature verification (Zerion-style, Stripe-style)
  - Durable queue + retry + dead-letter
  - Idempotency keys
  - Structured logging + trace ids
- “Agent Budget Guard”:
  - per-job/per-day spend caps, alert when exceeded
- Runbooks:
  - incident checklist, dashboards, SLOs

## “Expensive/Reliable” (Phase 2)
- Hosted control plane (optional): dashboard, alert routing, saved runs
- Turnkey integrations: Telegram alerts, Slack, email
- Audit trails + signed event logs
