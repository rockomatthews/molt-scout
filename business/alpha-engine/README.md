# Alpha Engine (Option B)

Pipeline: Farcaster (Neynar) → score → alert/log → (optional) trade via Bankr.

## Safety defaults
- `config.json` starts with `dryRun=true` and `liveTrading=false`.
- Trading is **disabled** until you:
  1) set `mode.liveTrading=true` and `mode.dryRun=false`
  2) provide required keys (Neynar + Bankr)
  3) confirm venues

## Setup

```bash
cd business/alpha-engine
npm i
cp .env.example .env
# fill keys
npm run dev
```

## Files
- `config.json` — risk caps + toggles
- `state.json` — cooldown + pnl/exposure tracking
- `logs/events.jsonl` — audit trail
- `public/index.html` — simple viewer (best served via a local http server)
