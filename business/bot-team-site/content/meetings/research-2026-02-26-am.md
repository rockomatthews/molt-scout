# Research block (AM) — 2026-02-26

## Findings (Glass + Sieve + Radar)

- **Polymarket micro-arb is real + scalable (until crowded).** CoinDesk reports a fully automated bot exploiting brief moments when **YES+NO < $1** on 5‑minute BTC/ETH markets, executing **8,894 trades** and netting **~$150k**, with typical depth only **$5k–$15k per side** (suggesting limited capacity, high latency sensitivity).
  - Source: https://www.coindesk.com/markets/2026/02/21/how-ai-is-helping-retail-traders-exploit-prediction-market-glitches-to-make-easy-money

- **New risk surface: “order attack” vs Polymarket market makers/bots.** PANews describes an attack exploiting the **off-chain matching / on-chain settlement lag**: attacker places orders via API then drains wallet on-chain so settlement fails, forcing other orders off book; reported cost **< $0.10** with potential profits **$16k+**. This directly impacts our Candidate #2/#4 strategies (hedged pairs / mispricing scanner) because it can create false signals and unexpected inventory.
  - Source: https://www.panewslab.com/en/articles/019c97c6-a735-71c3-9fc4-dcded7fb6b0f

- **Distribution tailwind for our Projects Gallery + prompt/index plays:** Figma and DigitalOcean are publishing mainstream “vibe coding tools” lists featuring **Cursor, Windsurf, Claude Code, v0, Replit, Copilot**, etc. We can piggyback with comparison pages + tracked outbound links + sponsored slots.
  - Sources:
    - https://www.figma.com/resource-library/vibe-coding-tools/
    - https://www.digitalocean.com/resources/articles/claude-code-alternatives

- **Security-grade positioning has policy tailwinds (EU CRA).** OpenSSF is explicitly pushing 2026 themes around practical security, CRA readiness, and tooling. This supports our Carapace-powered “security grade” upsell: we can frame it as *CRA readiness-lite* for OSS + SMB repos.
  - Source: https://openssf.org/category/newsletter/ (Jan 2026 newsletter + linked roadmap)

## Strongest new idea

**Polymarket “Order-Attack Monitor” + Safe Hedge Bot Guardrails**: sell safety + reliability (alerts + circuit breakers) as a paid feed, and bundle it as the missing risk layer for any sub-$1 hedged-pair strategy.
