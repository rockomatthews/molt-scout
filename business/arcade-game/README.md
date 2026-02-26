# Arcade — Tile Control (MVP spec)

Goal: an *immediately legible* web game that is fun in 10 seconds and monetizes via paid rounds.

## Core loop (Takeover-inspired, but ours)
- There is a **10×10 grid (100 tiles)**.
- Every tile has an **owner** (or empty).
- You can **capture** a tile by paying an entry fee for the round (or per-capture credit).
- Captures are **skill + randomness**:
  - skill: timing + pattern (you choose which tile, and you can chain captures)
  - randomness: a “dice roll” modifier influences success chances

## Game mode v0: "Hot Potato Crown"
- The grid has exactly **1 Crown tile** at any time.
- If you capture the Crown tile, you become **King/Queen**.
- While you hold Crown, you earn **a drip of points**.
- If someone captures your Crown tile, they steal the crown.

## Round structure
- Rounds are short: **3 minutes**.
- Entry to play a round: **$1** (offchain for now).
- Prize pool: 70% to winner, 20% to second, 10% to house.

## Anti-boring mechanics
- "Surge" events: every 30 seconds, 5 random tiles become **2× value** for 10 seconds.
- "Shield" power: once per round, you can shield a tile for 8 seconds.

## Why this lures the public
- Understandable in 1 sentence: "steal the crown; hold it to win."
- Fast rounds; always a reason to click.
- Leaderboard creates status.

## MVP build checklist
- [ ] Next.js app with realtime state (Supabase Realtime or simple WS)
- [ ] Anonymous handle + simple login
- [ ] Single game room (one round at a time)
- [ ] Basic capture mechanic + crown
- [ ] Leaderboard (points + wins)
- [ ] Stripe/USDC payments later (for now: fake credits)

## Metrics
- time-to-first-action < 10s
- % players who play 2nd round
- conversion: free viewer → paid entrant
