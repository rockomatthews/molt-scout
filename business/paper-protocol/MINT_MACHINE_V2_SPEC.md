# Paper Protocol v2 — “Mint Machine” (Skill Mining)

Goal: **a coin that is fun to mine and challenging**, with **lots of user interaction** and **no spammy crypto warning UX**.

This is not “cloud mining”. It’s a **game loop** that produces an onchain token using **proof-of-play** (skill + effort) and anti-bot constraints.

---

## 0) One-liner
A 60–180 second “run” where you play a tiny skill challenge to earn **hash power**, which advances your **mint progress** toward a capped daily emission.

---

## 1) Core loop (what the user does)
### Session: “Run” (60–180s)
1) **Pick a rig mode** (optional): Safe / Normal / Overclock
2) Play a short **skill challenge** (varies per run)
3) Receive:
   - **Hash** (points) for this run
   - **Heat** (fatigue) that limits spam
   - **Loot** (rig parts / cosmetics) occasionally
4) Hash advances your **Mint Meter**.
5) When the meter crosses a threshold, you can **Mint** (onchain) and claim tokens.

### Daily rhythm
- Users get a daily **energy budget** (or “coolant”) that replenishes.
- Streaks: consecutive days grant cosmetic + small efficiency boosts (non-compounding, capped).

---

## 2) Challenge types (fun + hard + anti-bot)
We want challenges that are:
- fast to learn, hard to master
- hard to automate reliably
- generate verifiable “receipts” (a signed run result)

Suggested “challenge pack v1”:
1) **Pattern Snap** (visual): 3–5 quick pattern picks under time pressure.
2) **Memory Fuse**: watch a 2s sequence → reproduce.
3) **Risk Switch** (strategy): choose between 2–3 routes with different expected value and volatility.
4) **Timing Window**: stop a moving bar inside a shrinking window.

Rotation reduces bot advantage; difficulty scales per user.

---

## 3) Anti-bot + anti-farm design (without annoying users)
### A) Rate limiting via game mechanics
- **Heat** increases with each run.
- High heat reduces hash yield and increases failure penalties.
- Cooldown / “coolant” items reduce heat (earned, not bought at first).

### B) Difficulty scaling & entropy
- Each run uses server-provided entropy + per-user seed.
- Micro-variations in layout/timing make scripted bots brittle.

### C) Proof-of-play receipt
Each run produces a server-signed receipt:
- userId, challengeId, params hash, score, durationMs, timestamp, nonce
- server signs receipt (HMAC / Ed25519)

Onchain mint requires presenting a valid receipt bundle.

### D) Soft identity
- Optional: “phone/SMS” is **not** required.
- Use device fingerprint + rate limits + suspicious pattern scoring.

---

## 4) Token emission model (keeps it sane)
Principles:
- no infinite farm
- predictable and capped
- rewards skill and consistency

Proposal:
- **Daily emission cap**: fixed number of tokens/day.
- Each day has a **global mining pool** of hash.
- Your share = your hash / total hash, capped per user.

This creates a real competition loop and prevents whales from buying infinite output.

---

## 5) Onchain vs offchain responsibilities
### Offchain (Next.js + Supabase)
- user accounts, profiles, streaks
- run orchestration and verification
- receipt issuance + fraud scoring
- leaderboards

### Onchain (Base)
- ERC-20 token
- Mint contract that:
  - validates signed receipts (or Merkle root of receipts)
  - enforces daily emission cap
  - enforces per-user cap

---

## 6) UX: “no spammy crypto warnings”
The rule: **no modal popups every time**.

Design:
- A single **Safety** page, accessible in settings.
- First-time user sees a clean 1-screen “This is a game token” notice with:
  - checkbox “don’t show again”
  - link to Safety page
- No “financial advice” screaming banners.
- Copy tone: calm, short, non-preachy.

---

## 7) Monetization (optional, later; keep v1 pure)
Do NOT pay-to-win in v1.

Later options:
- cosmetics
- season passes (cosmetics + QoL only)
- rig skins
- tournament entry fees paid in USDC on Base (explicit approval gate)

---

## 8) MVP scope (ship fast)
MVP (1 week):
- 1 challenge type (Timing Window)
- runs + receipts + offchain leaderboard
- mint meter (offchain)
- “claim mint” onchain (receipt bundle validation)
- basic safety page

V1 (2–3 weeks):
- 4 challenge types rotation
- streaks + rig parts (non-pay)
- fraud scoring v1
- season + weekly tournaments

---

## 9) Acceptance tests (what “good” looks like)
- Day-1 retention: users come back for streak
- Run completion rate > 70%
- Average session length 90–180s
- Mint success rate > 98% (low friction)
- Bot/farm attempts detectable via anomaly scoring

---

## 10) Immediate next steps
1) Pick challenge style emphasis: **Arcade** vs **Strategy** (or 70/30 mix).
2) Decide token name + theme (Paper Protocol tie-in or new IP).
3) Implement MVP “Timing Window” in the existing Paper Protocol site.
4) Add receipt signing + minimal onchain validator.

