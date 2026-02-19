# OTC Fulfillment (AOT)

Goal: make the OTC flow less manual.

## How it works
- Website `/api/otc` verifies a USDC transfer on Base and saves a `pending` row in Supabase table `otc_requests`.
- A local script (run on the Mac) pulls pending rows and sends AOT to the receiver wallet.

This keeps the distributor private key **off Vercel**.

## Supabase table
Create a table `otc_requests` with columns:
- id (uuid, pk)
- created_at (timestamptz, default now())
- chain_id (int)
- payer_wallet (text)
- receiver_wallet (text)
- usdc_amount (numeric)
- usdc_tx_hash (text, unique)
- status (text) — 'pending' | 'fulfilled' | 'error'
- aot_amount (numeric)
- aot_tx_hash (text)
- error (text)

## Env vars (Vercel)
Set on the Vercel project hosting `agent-ops-toolkit-site`:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Env vars (local, for fulfillment script)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- BASE_RPC_URL (Base mainnet)
- AOT_TOKEN_ADDRESS=0xac6a77A1b30E7242d9e64581BF80D344B78a9d27
- DISTRIBUTOR_PRIVATE_KEY=0x... (wallet holding AOT)

## Run
From repo root:
```bash
node business/otc-fulfill/fulfill.js
```
