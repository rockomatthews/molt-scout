const TICKERS = [
  "BTC",
  "ETH",
  "SOL",
  "HYPE",
  "MOLT",
  "BNKR",
  "CLANKER",
  "OPENCLAW",
];

export function extractTickers(text: string): string[] {
  const out = new Set<string>();
  const upper = text.toUpperCase();
  for (const t of TICKERS) {
    if (upper.includes(`$${t}`) || upper.includes(` ${t} `) || upper.includes(`#${t}`)) out.add(t);
  }
  return [...out];
}

export function scorePost(text: string): number {
  const upper = text.toUpperCase();
  let s = 0;

  // tickers
  const tickers = extractTickers(text);
  s += Math.min(40, tickers.length * 15);

  // urgency / catalyst words
  const catalysts = [
    "BREAK",
    "BREAKING",
    "LAUNCH",
    "LIST",
    "LISTING",
    "AIRDROP",
    "CLAIM",
    "MAINNET",
    "UPGRADE",
    "PARTNERSHIP",
    "LEAK",
    "ALPHA",
  ];
  for (const c of catalysts) if (upper.includes(c)) s += 6;

  // money intent
  if (upper.includes("BUY") || upper.includes("SELL") || upper.includes("LONG") || upper.includes("SHORT")) s += 10;

  // downrank obvious noise
  if (upper.includes("NOT FINANCIAL ADVICE") || upper.includes("NFA")) s -= 2;
  if (text.length < 40) s -= 5;

  return Math.max(0, Math.min(100, s));
}
