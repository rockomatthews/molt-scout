---
name: polymarket-agents
description: |
  Polymarket Agents (official) playbook. Framework for building AI agents around Polymarket data + workflows.
  Use for read-only intel, dataset building, and (later) execution components (approval-gated).
---

# Polymarket Agents (Official) — Playbook

Upstream:
- https://github.com/Polymarket/agents

## What we use it for
- Build **read-only** Polymarket intel agents (market discovery, hedge search, anomaly detection)
- Standardize how we structure prompts/tools around Polymarket data

## Setup (local)
Python 3.9 recommended by upstream.

```bash
git clone https://github.com/Polymarket/agents.git
cd agents
python3.9 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Guardrails (our policy)
- No private keys in chat.
- No live trading/execution without explicit APPROVE.
- Use it primarily as an **intel + research** framework.
