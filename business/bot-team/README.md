# Bot Team Ops

Operational scripts for running The Bot Team.

## Claw Beacon (mission control) sync

Claw Beacon provides a kanban board + live feed for agent work.

This repo already contains the canonical sources-of-truth:
- Queue: `business/bot-team-site/content/QUEUE.md`
- Meeting transcripts: `business/bot-team-site/content/meetings/*.md`

The sync script reads those files and upserts tasks into Claw Beacon.

### Setup

Export env vars:

```bash
export CLAW_BEACON_API_URL="https://your-backend.railway.app"
# optional
export CLAW_BEACON_API_KEY="your-api-key"
```

### Run

```bash
npm run --prefix business/bot-team beacon:sync
```

### Notes
- The script is idempotent: it uses a deterministic external id per queue candidate.
- We do not auto-spend or auto-settle anything from Beacon; it’s task/state visibility only.
