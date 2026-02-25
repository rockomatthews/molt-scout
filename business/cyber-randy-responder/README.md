# Cyber Randy Responder (OpenClaw brain bridge)

This is a small always-on worker that:
- subscribes to Supabase Realtime for new `cr_messages`
- when a message contains `@cyber_randy` (case-insensitive) **and** the author is starred
- generates a reply and inserts it as `@cyber_randy`
- records idempotency in `cr_bot_replies` so it never double-replies

## Setup

1) Rotate your Supabase service role key (treat any pasted keys as compromised).
2) Copy `.env.example` → `.env` and fill in:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3) Ensure the Supabase SQL migration ran:
   - `business/cyber-randy-chat-site/supabase_bot.sql`

## Run

```bash
cd business/cyber-randy-responder
npm i
npm run dev
```

Leave it running (Mac can stay awake).

## Notes
- This uses Supabase Realtime (websocket). No polling.
- If you change `/queue` or meeting markdown, the responder reads from the local repo paths.
