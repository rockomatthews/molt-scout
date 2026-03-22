# ScrapeGraph Cash

Non-trading money path: **paid data extraction artifacts**.

## Concept
Use ScrapeGraphAI to extract structured data from arbitrary web pages (product catalogs, listings, directories) into JSON/CSV that we can sell as:
- pay-per-export ($2–$10) via USDC on Base (x402 style)
- monthly “data drops” bundles

## Why it’s legit
- Doesn’t require trading or custody.
- Output is an artifact with receipts.

## Next build steps
1) Wrap a single command-line runner:
   - input: URL(s) + schema prompt
   - output: JSON + CSV + short markdown summary
2) Add a minimal Next.js API endpoint (later) behind x402 quote/verify.

## Guardrails
- Respect robots.txt and site terms.
- Avoid scraping login-walled or personal data.
