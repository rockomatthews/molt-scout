# Hyperliquid Arb Pivot (DRY_RUN-first)

Goal: Build a **measurable** Hyperliquid-based arbitrage/edge loop that can be run autonomously with tight risk caps.

This branch is a pivot path if Base spot DEX arb remains too sparse.

## Guiding constraints
- **DRY_RUN by default**: alerts + simulated fills only.
- No live execution until explicit user approval.
- Respect caps (future live): $10/trade, $120 exposure, $50 daily loss.

## What “arb” can mean on Hyperliquid
Hyperliquid is perps, so classic DEX-vs-DEX spot arb isn’t the primary mode. Practical edges:

1) **Cross-venue price arb** (HL mid vs reference)
   - Compare HL mark/mid vs: Binance/Bybit spot/perp, Coinbase spot, or an index feed.
   - Actionability: requires fast execution + stable quote sources.

2) **Funding/basis capture**
   - Monitor funding rates + open interest; enter small positions when expected funding dominates adverse selection.

3) **Microstructure / spread capture**
   - Detect temporary wide spreads / orderbook dislocations on HL and place maker orders.

4) **Liquidation / volatility events**
   - Detect sharp cascades (OI + price + liquidation prints) and trade mean reversion with strict stops.

## Minimal viable build (next)
### A) Data collectors
- Pull HL metadata (available coins, tick sizes)
- Pull live prices
- Pull orderbook snapshots (top of book)
- Pull funding rates

### B) Signal engine (DRY_RUN)
- Define 2–3 candidate signals with clear thresholds.
- Log every evaluation with timestamp and computed edge.
- Emit Telegram alerts only when above threshold.

### C) Simulator
- For each signal, simulate a market or limit fill using top-of-book.
- Track PnL under conservative slippage.

## Deliverables
- `src/hl/` client (read-only)
- `src/hl/signals/` signal implementations
- `logs/hl_signals.jsonl` with structured events
- Cron job: every 30–60s, DRY_RUN alerts only
