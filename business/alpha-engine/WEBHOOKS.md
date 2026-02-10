# Zerion Webhooks (Clicker edge)

We run a local webhook receiver and expose it publicly (required for Zerion webhooks).

## Run locally

```bash
cd business/alpha-engine
npm run webhooks
```

Health check:
- http://localhost:3333/health

Webhook endpoint (default):
- http://localhost:3333/zerion-webhook

## Exposing to the internet
Zerion needs a public HTTPS URL. Options:

### Option A: Tailscale Funnel (recommended if you already use Tailscale)
- Run Tailscale on the Mac
- Funnel port 3333

### Option B: Cloudflare Tunnel
- Create a tunnel and route a subdomain to localhost:3333

### Option C: ngrok
- `ngrok http 3333`

Once you have the public URL, configure Zerion webhooks to POST to:
- `https://<your-public-host>/zerion-webhook`

## Logs
Incoming webhooks are appended to:
- `logs/zerion_webhooks.jsonl`
