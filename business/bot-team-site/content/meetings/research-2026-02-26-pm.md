# Research block (PM) — 2026-02-26

## Snapshot (Forge + Atlas + Helix)

### Repo health / what feels brittle
- **Queue hygiene:** `content/QUEUE.md` had a duplicated Candidate #6 block (easy to miss, but it breaks “one source of truth” for the pipeline). I removed the duplicate so we don’t accidentally fork priorities.
- **Ops surfaces are still mostly manual:** research notes + ideas land in markdown, but there’s no lightweight “validation” step (format/lint/duplicate detection) before commit.
- **Bot projects are local-first:** `polymarket-bot/` isn’t its own git repo here (no CI, no deployment targets). That’s fine for prototyping, but it’s brittle for anything that needs uptime.
- **Secret drift risk:** local `.env` files exist (expected) but we should assume “someone will eventually commit the wrong thing” unless we add guardrails.

### What seems blocked
- Anything Polymarket-execution-related is likely blocked on: credentials/keys, stable market-data ingest, and a decision on “alerts-only vs. execution” posture.
- Monetization experiments are blocked on: a single, clear checkout/payment path (USDC invoice + delivery) and a CTA surface on the website.

## Two concrete implementation tasks (revenue + reliability unlocks)

### Task 1 (Revenue): “Security Grade” landing + intake + payment link
**Goal:** turn Candidate #6 into a thing someone can buy in 1 click.
- **Implement:** Add a new page to `business/bot-team-site`:
  - `/security-grade` with: offer tiers ($99/$299/$499), what we deliver (report + optional PR), and a simple intake form (repo URL + contact).
  - Add a CTA button on Projects/Gallery pointing to `/security-grade`.
- **Payment (MVP):** start with manual USDC invoicing (address + memo) or a Stripe link; the key is reducing friction *now*.
- **Acceptance:** we can send someone a link, they can submit a repo + pay, and we have a repeatable checklist to deliver a report.

### Task 2 (Reliability): “Queue + meetings linter” pre-commit check
**Goal:** prevent obvious pipeline drift (duplicates, wrong filenames) and reduce human error.
- **Implement:** a tiny Node script in repo root (or in `business/bot-team-site`) that:
  - validates `content/QUEUE.md` (no duplicate headings for same Candidate/date; required fields present),
  - validates new meeting notes filenames match `YYYY-MM-DD` and have a header,
  - optionally blocks commits if `.env` / secrets-like files are staged.
- **Wire:** `husky` pre-commit or a simple `npm run lint:ops` in CI later.
- **Acceptance:** running the script fails fast on duplicates / bad filenames; it would have caught today’s duplicate Candidate #6.

## Notes / next
- If we want to monetize faster than we can harden infra, we should bias toward **paid reports + alerts** (human-in-the-loop) first, then “always-on bots” once data + execution is stable.
