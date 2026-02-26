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

The current MVP runs in **local-only mode** even without Supabase; the next step is persisting the board + Realtime.

## Routes
- `/` landing
- `/play` local MVP arena
