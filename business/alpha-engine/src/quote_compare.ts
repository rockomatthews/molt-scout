import fs from 'node:fs';
import path from 'node:path';
import { getPulseTokenTransactions } from './pulse.js';

const BASE_CHAIN_ID = 8453;
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;

const OUT_PATH = path.resolve('logs/pulse_quote_alerts.json');
const STATE_PATH = path.resolve('state.pulse_quotes.json');

type State = { seen: Record<string, number> };

function loadState(): State {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return { seen: {} };
  }
}
function saveState(s: State) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
}

function num(x: any): number | null {
  const n = typeof x === 'string' ? Number(x) : typeof x === 'number' ? x : NaN;
  return Number.isFinite(n) ? n : null;
}

async function fetchDexscreenerToken(tokenAddress: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`dexscreener http ${res.status}`);
  return res.json() as Promise<any>;
}

function pickDecimals(ds: any, tokenAddress: string): number | null {
  const pairs: any[] = Array.isArray(ds?.pairs) ? ds.pairs : [];
  for (const p of pairs) {
    if ((p?.chainId ?? '').toLowerCase() !== 'base') continue;
    const baseAddr = String(p?.baseToken?.address ?? '').toLowerCase();
    if (baseAddr !== tokenAddress.toLowerCase()) continue;
    const d = num(p?.baseToken?.decimals);
    if (d !== null) return d;
  }
  return null;
}

function toBaseUnits(amountFloat: number, decimals: number): string {
  const factor = 10 ** decimals;
  // avoid float issues by rounding
  const amt = Math.round(amountFloat * factor);
  return String(amt);
}

function fromBaseUnits(amountIntStr: string, decimals: number): number {
  const amt = Number(amountIntStr);
  if (!Number.isFinite(amt)) return NaN;
  return amt / 10 ** decimals;
}

async function quoteParaswap(opts: {
  destToken: string;
  destDecimals: number;
  sellAmountUsdc: number;
}): Promise<{ outTokens: number; raw: any } | null> {
  const amount = toBaseUnits(opts.sellAmountUsdc, USDC_DECIMALS);
  const url = new URL('https://apiv5.paraswap.io/prices');
  url.searchParams.set('srcToken', USDC_BASE);
  url.searchParams.set('destToken', opts.destToken);
  url.searchParams.set('amount', amount);
  url.searchParams.set('srcDecimals', String(USDC_DECIMALS));
  url.searchParams.set('destDecimals', String(opts.destDecimals));
  url.searchParams.set('side', 'SELL');
  url.searchParams.set('network', String(BASE_CHAIN_ID));

  const res = await fetch(url.toString(), { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  const json = await res.json();
  const destAmount = json?.priceRoute?.destAmount;
  if (!destAmount) return null;
  return { outTokens: fromBaseUnits(String(destAmount), opts.destDecimals), raw: json };
}

async function quoteOdos(opts: {
  destToken: string;
  destDecimals: number;
  sellAmountUsdc: number;
}): Promise<{ outTokens: number; raw: any } | null> {
  // Odos SOR v2 (commonly used). If endpoint changes, this will fail gracefully.
  const url = 'https://api.odos.xyz/sor/quote/v2';
  const amountIn = toBaseUnits(opts.sellAmountUsdc, USDC_DECIMALS);
  const body = {
    chainId: BASE_CHAIN_ID,
    inputTokens: [{ tokenAddress: USDC_BASE, amount: amountIn }],
    outputTokens: [{ tokenAddress: opts.destToken, proportion: 1 }],
    userAddr: '0x0000000000000000000000000000000000000000',
    slippageLimitPercent: 0.3,
    disableRFQs: true,
    compact: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const out = json?.outAmounts?.[0];
  if (!out) return null;
  return { outTokens: fromBaseUnits(String(out), opts.destDecimals), raw: json };
}

function pctDiff(a: number, b: number): number {
  // (max-min)/min
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  if (!Number.isFinite(min) || min <= 0) return 0;
  return (max - min) / min;
}

async function main() {
  const state = loadState();
  const now = Date.now();

  const sellAmountUsdc = Number(process.env.QUOTE_SELL_USDC ?? '100');
  const amountMinUsd = Number(process.env.PULSE_AMOUNT_MIN_USD ?? '200');
  const marketCapMaxUsd = Number(process.env.PULSE_MARKETCAP_MAX_USD ?? '20000000');
  const minQuoteEdge = Number(process.env.MIN_QUOTE_EDGE ?? '0.003'); // 0.3%

  const pulse = await getPulseTokenTransactions({
    amountMinUsd,
    marketCapMaxUsd,
    limit: 50,
    offset: 0,
    onlyWithProfile: true,
  });

  const alerts: any[] = [];

  for (const ev of pulse) {
    if (ev.chain !== String(BASE_CHAIN_ID)) continue;
    if (!ev.tokenAddress) continue;
    if (!ev.hash) continue;

    const key = `${ev.tokenAddress.toLowerCase()}:${ev.hash}`;
    if (state.seen[key]) continue;
    state.seen[key] = now;

    let ds: any;
    try {
      ds = await fetchDexscreenerToken(ev.tokenAddress);
    } catch {
      continue;
    }

    const decimals = pickDecimals(ds, ev.tokenAddress);
    if (decimals === null) continue;

    const [p, o] = await Promise.all([
      quoteParaswap({ destToken: ev.tokenAddress, destDecimals: decimals, sellAmountUsdc }),
      quoteOdos({ destToken: ev.tokenAddress, destDecimals: decimals, sellAmountUsdc }),
    ]);

    if (!p || !o) continue;

    const edge = pctDiff(p.outTokens, o.outTokens);
    if (edge < minQuoteEdge) continue;

    const better = p.outTokens > o.outTokens ? 'paraswap' : 'odos';

    alerts.push({
      kind: 'quote_edge',
      ts: ev.timestamp,
      wallet: ev.walletAddress,
      txHash: ev.hash,
      tokenAddress: ev.tokenAddress,
      approxBuyUsd: ev.amountUsd,
      marketCap: ev.marketCap,
      sellAmountUsdc,
      paraswapOut: p.outTokens,
      odosOut: o.outTokens,
      edge,
      better,
    });
  }

  // prune seen (3 days)
  const keepMs = 3 * 24 * 60 * 60 * 1000;
  for (const [k, v] of Object.entries(state.seen)) {
    if (now - v > keepMs) delete state.seen[k];
  }

  saveState(state);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), alerts }, null, 2));

  console.log(JSON.stringify({ count: alerts.length, alerts: alerts.slice(0, 5) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
