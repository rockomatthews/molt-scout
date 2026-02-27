# Research block (AM) — 2026-02-27

## Quick findings (fresh)

- **Polymarket 5-minute micro-arb is “real enough” to market:** CoinDesk (2026-02-21) describes an automated bot doing **8,894 trades** on Polymarket short-term crypto markets by buying **YES+NO when the sum briefly dipped below $1**, reportedly netting **~$150k** (thin liquidity, fleeting windows, edge is automation/latency).
  - Source: https://www.coindesk.com/markets/2026/02/21/how-ai-is-helping-retail-traders-exploit-prediction-market-glitches-to-make-easy-money

- **Execution details to bake into our scanner/bot roadmap:** A recent Polymarket arb guide (2025–2026) emphasizes the now-common split between **Gamma markets metadata** + **CLOB order book** for live prices/depth; mentions richer book metadata (`min_order_size`, `tick_size`, `neg_risk`) and that serious bots move to **WebSockets vs polling** because mispricings last seconds.
  - Source: https://medium.com/@benjamin.bigdev/high-roi-polymarket-arbitrage-in-2026-programmatic-dutch-book-strategies-bots-and-portfolio-41372221bb79

- **x402 (HTTP 402 + USDC) is solidifying into the agent payments default:** Circle’s writeup frames x402 as the missing “agent can pay” layer; Zuplo’s post explicitly connects **x402 → paid APIs + MCP servers** (pay-per-request, no accounts/subscriptions) for 2026 agentic workflows.
  - Sources:
    - https://www.circle.com/blog/autonomous-payments-using-circle-wallets-usdc-and-x402
    - https://zuplo.com/blog/mcp-api-payments-with-x402

- **Distribution angle for Prompt Pattern Index / affiliate router:** DigitalOcean published (2026-02-11) a “Claude Code alternatives” list that’s basically a pre-built keyword cluster (Claude Code, Gemini CLI, Cline, Aider, Copilot, Cursor, Replit, Windsurf, Amazon Q, Continue, Codex). This supports a programmatic “comparison + decision tree + pricing tracker” funnel.
  - Source: https://www.digitalocean.com/resources/articles/claude-code-alternatives

## Strongest new idea

**Ship a paywalled “agent tool” (MCP server) that sells Polymarket edge data via x402.**

- Positioning: “Your agent can *buy* market microstructure intelligence on demand.”
- Packaging: MCP server + HTTP API. Every call (snapshot, spread/arb scan, backtest export) is **x402 pay-per-call**.
- Why this is strong: It directly stitches together queue items **(#2/#4 Polymarket edge)** + **(#5 x402 endpoints)** + **(#6 thesis-card artifacts)** into one coherent, monetizable wedge.
