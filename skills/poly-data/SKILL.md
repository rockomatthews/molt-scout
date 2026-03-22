---
name: poly-data
description: |
  Polymarket data pipeline (markets + Goldsky orderFilled events + processed trades).
  Use to build local datasets and generate trade/microstructure artifacts.
---

# poly_data — Polymarket data pipeline

Upstream:
- https://github.com/warproxxx/poly_data

## What we use it for
- Build an internal Polymarket trade dataset
- Generate artifacts (volume/flow regimes, slippage estimates, sub-$1 windows)

## Setup (uv)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh

git clone https://github.com/warproxxx/poly_data.git
cd poly_data
uv sync
```

Run pipeline:
```bash
uv run python update_all.py
```

## Guardrails
- Data collection can be heavy; schedule sparingly.
- Research only by default.
