---
name: freqtrade
description: |
  Freqtrade playbook: open-source crypto trading bot with backtesting + hyperopt + paper trading.
  Use to learn systematic strategy iteration and evaluation discipline.
---

# Freqtrade — Trading Skill (Backtest/Paper-first)

Upstream:
- https://github.com/freqtrade/freqtrade

## Why this skill matters for profit
Freqtrade is a mature framework for:
- **repeatable backtests**
- **paper trading**
- **strategy optimization (hyperopt)**

We will **not** turn on live execution without explicit approval.

## Install (local)
Best via docker or python venv.

### Docker (recommended)
```bash
# example
docker pull freqtradeorg/freqtrade:stable
```

### Python
```bash
pip install freqtrade
```

## Core workflows to learn
1) Backtest a simple strategy over a fixed window
2) Add one filter/change
3) Compare metrics (expectancy, drawdown, trade count)
4) Only then adjust sizing

## How we apply it to alpha-engine
We borrow the discipline:
- define the strategy as a config+code artifact
- test in replay/backtest
- promote only if metrics improve

## Guardrails
- Backtest/paper only by default.
- No keys in chat.
