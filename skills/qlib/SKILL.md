---
name: qlib
description: |
  Qlib (Microsoft) quantitative research workflow skill/playbook.
  Use this to run factor-style backtests, model training, and evaluation loops.
  Focus: turning hypotheses into measurable A/B results (signals → backtest → report).
---

# Qlib (Microsoft) — Quant Research Playbook

Upstream:
- Repo: https://github.com/microsoft/qlib
- Docs: https://qlib.readthedocs.io/

## What this is for (in our stack)

We use Qlib for **mathy, disciplined iteration**:
- define factors/signals
- run backtests/research workflows
- export metrics + compare variants

For alpha-engine, Qlib is a reference architecture for:
- **feature engineering** (multi-factor scoring)
- **evaluation discipline** (train/valid/test splits, leakage checks)
- **repeatable backtests** (comparable reports)

## Local setup (Mac)

Qlib is Python-based. Recommended: conda env.

### 1) Install Python tooling

If you don’t have Python/conda installed:
- Install Miniforge/Conda (recommended), then create a clean env.

### 2) Create env + install

```bash
conda create -n qlib python=3.11 -y
conda activate qlib

# Mac tip (especially Apple Silicon):
brew install libomp

pip install -U pip
pip install pyqlib
```

Or dev install:

```bash
git clone https://github.com/microsoft/qlib.git
cd qlib
pip install -e .
```

## Data

Qlib needs a dataset. The upstream README notes the official dataset is sometimes disabled; community releases exist.

Example (from upstream README):

```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

## Quick “does it run” test

Try the code-based workflow example:
- https://github.com/microsoft/qlib/blob/main/examples/workflow_by_code.py

## How we’ll use this to improve alpha-engine

We will not switch alpha-engine to Qlib.
Instead we’ll *import Qlib discipline*:

1) **Factorize our entry score**
   - turn current gates (momentum, buy pressure, liquidity, txns, quoteConfidence) into numeric factors
   - normalize (z-score) and combine into a single score

2) **Offline evaluation loop**
   - use replay logs as our “dataset”
   - build a simple backtest/eval harness that compares factor variants (A/B)

3) **Export artifacts**
   - JSON report of factor weights + performance deltas
   - keep a changelog that ties config fingerprint → results

## Guardrails
- Read-only research by default.
- No live trading changes without explicit approval.
