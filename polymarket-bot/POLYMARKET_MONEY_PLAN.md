# Polymarket money paths (DRY_RUN-first)

This branch explores ways to make money on Polymarket with strict risk caps.

## 1) “Box arb” (classic)
Buy YES and NO if the best asks sum to < 1.0 - buffer.
- Needs: live orderbooks, fees, fill risk.
- Risk: partial fills, fast book changes.

## 2) Cross-market arb / redundancy
- Same outcome across different markets (e.g. related/duplicate resolutions).
- Harder: requires semantic matching + resolution risk.

## 3) Mispricing vs external odds (market making / value)
- Compare market implied probability to external signals.
- Not true arb; more like statistical edge.

## MVP for this repo
- DRY_RUN scanner over a market universe.
- Alert only when expected edge clears threshold.
- Log: book snapshot, implied prices, estimated profit after fees.

## Execution (later)
Only after 5 good DRY_RUN alerts and explicit approval:
- Place paired orders (or route via best maker/taker strategy)
- Track fills and residual exposure
