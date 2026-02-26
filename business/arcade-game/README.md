# Arcade Game (Hot Potato Crown)

Next.js MVP scaffold for the Bot Team gaming project.

## Local run

```bash
cd business/arcade-game
npm i
npm run dev
```

## Vercel + Supabase

This repo is **ready for Vercel**.

On Vercel, add the Supabase integration (or set env vars manually):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Also set WalletConnect (for mobile wallets):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (see `.env.example`)

Then run the SQL in `supabase.sql` in your Supabase project.

The app runs in local-only mode without Supabase, but multiplayer + persistence requires Supabase.

## Routes
- `/` landing
- `/play` local MVP arena
