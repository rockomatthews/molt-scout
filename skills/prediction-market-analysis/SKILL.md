---
name: prediction-market-analysis
description: |
  Large public Polymarket+Kalshi dataset + analysis framework (uv + parquet + figures).
  Use to generate paid, reproducible research artifacts (charts/tables/JSON) without trading.
---

# Prediction Market Analysis — Playbook

Upstream:
- https://github.com/Jon-Becker/prediction-market-analysis

## Why this matters (money path without execution)
- Produces **exportable artifacts** (PNG/PDF/CSV/JSON) from Polymarket/Kalshi data.
- We can sell “intel with receipts” as pay-per-export (x402/USDC) without placing trades.

## Setup
Requires Python 3.9+ and `uv`.

```bash
# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

git clone https://github.com/Jon-Becker/prediction-market-analysis.git
cd prediction-market-analysis
uv sync
make setup   # downloads big dataset
```

## Run
```bash
make analyze
```

## Guardrails
- Read-only research.
- Dataset is large; keep outputs small and cache artifacts.
