---
name: clob-client-ts
description: |
  Polymarket official TypeScript CLOB client playbook.
  Use for building fast read-only snapshot pipelines and (later) execution bots behind approval gates.
---

# clob-client (TypeScript) — Polymarket CLOB

Upstream:
- https://github.com/Polymarket/clob-client

## Install
```bash
npm i @polymarket/clob-client ethers
```

## What we use it for
- Deterministic, typed market snapshot artifacts (JSON + CSV)
- Integrate into our `polymarket-artifacts-site` and x402 pay-per-export endpoints

## Guardrails
- Read-only by default.
- No order posting without explicit approval.
