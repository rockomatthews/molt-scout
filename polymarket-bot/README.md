# polymarket-bot (simple)

A small, *conservative* Polymarket CLOB bot skeleton (Node.js) that can:
- discover active markets with orderbooks
- check for simple **box arb** on binary markets (buy YES + buy NO when sum < 1 - buffer)
- place IOC/GTC orders via the official `@polymarket/clob-client`

## Safety / reality check
- Prediction markets are risky. “Cheap NO” strategies can blow up.
- Start with **DRY_RUN=true**, then go live once logs look correct.
- Set strict caps (`MAX_TOTAL_USD`, `MAX_USD_PER_TRADE`).

## Setup

```bash
cd polymarket-bot
npm i
cp .env.example .env
```

Fill in:
- `PRIVATE_KEY`
- `FUNDER_ADDRESS`
- `SIGNATURE_TYPE`

### Generate / derive CLOB API keys

```bash
npm run keys
```

This will derive or create the API key for your signer and print it.
Copy the values into `.env` (optional but recommended).

## Run

### Dry run (recommended)

```bash
npm run dev
```

### Go live

Set:
- `DRY_RUN=false`

Then run again.

## What “box arb” means here
If best asks satisfy:

`ask_yes + ask_no < 1 - EDGE_REQUIRED`

the bot attempts to buy both legs.

## Notes
- This is a starting point, not a money printer.
- You’ll probably want a curated watchlist once you find liquid markets you like.
