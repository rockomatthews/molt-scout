import fs from 'node:fs';
import path from 'node:path';
import { getPulseTokenTransactions, PulseTx } from './pulse.js';

const STATE_PATH = path.resolve('state.pulse_arb.json');
const OUT_PATH = path.resolve('logs/pulse_arb_alerts.json');

type State = {
  seenTx: Record<string, number>; // txHash -> firstSeenMs
};

function loadState(): State {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return { seenTx: {} };
  }
}

function saveState(state: State) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function fetchDexscreenerToken(tokenAddress: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`dexscreener http ${res.status}`);
  return res.json() as Promise<any>;
}

function num(x: any): number | null {
  const n = typeof x === 'string' ? Number(x) : typeof x === 'number' ? x : NaN;
  return Number.isFinite(n) ? n : null;
}

function computeSpread(prices: number[]) {
  const ps = prices.filter((p) => Number.isFinite(p) && p > 0);
  if (ps.length < 2) return null;
  const min = Math.min(...ps);
  const max = Math.max(...ps);
  return { min, max, spread: (max - min) / min };
}

function chainNameFromId(chainId: string) {
  // wallet.xyz uses numeric networkId (e.g. 8453 for Base)
  if (chainId === '8453') return 'base';
  if (chainId === '1') return 'ethereum';
  if (chainId === '42161') return 'arbitrum';
  if (chainId === '10') return 'optimism';
  return chainId;
}

async function main() {
  const amountMinUsd = Number(process.env.PULSE_AMOUNT_MIN_USD ?? '1000');
  const marketCapMaxUsd = Number(process.env.PULSE_MARKETCAP_MAX_USD ?? '5000000');
  const minLiquidityUsd = Number(process.env.ARB_MIN_LIQ_USD ?? '10000');
  const minSpread = Number(process.env.ARB_MIN_SPREAD ?? '0.02'); // 2%

  const state = loadState();
  const now = Date.now();

  const pulse = await getPulseTokenTransactions({
    amountMinUsd,
    marketCapMaxUsd,
    limit: 50,
    offset: 0,
    onlyWithProfile: true,
  });

  const alerts: any[] = [];

  for (const ev of pulse) {
    const tx = ev.hash;
    if (!tx) continue;
    if (state.seenTx[tx]) continue;

    // mark seen immediately (even if enrichment fails) to avoid spam loops
    state.seenTx[tx] = now;

    // Only Base to start (Option 1)
    if (ev.chain !== '8453') continue;
    if (!ev.tokenAddress) continue;

    let ds: any;
    try {
      ds = await fetchDexscreenerToken(ev.tokenAddress);
    } catch {
      continue;
    }

    const pairs: any[] = Array.isArray(ds?.pairs) ? ds.pairs : [];
    const basePairs = pairs.filter((p) => (p?.chainId ?? '').toLowerCase() === 'base');

    // only use decent-liquidity pools
    const goodPairs = basePairs.filter((p) => {
      const liq = num(p?.liquidity?.usd);
      return liq !== null && liq >= minLiquidityUsd;
    });

    const prices = goodPairs.map((p) => num(p?.priceUsd)).filter((x): x is number => x !== null);
    const s = computeSpread(prices);
    if (!s) continue;
    if (s.spread < minSpread) continue;

    // pick min/max pools for context
    const minPair = goodPairs.reduce((best, p) => {
      const pr = num(p?.priceUsd);
      if (pr === null) return best;
      if (!best) return p;
      const bpr = num(best?.priceUsd) ?? Infinity;
      return pr < bpr ? p : best;
    }, null as any);
    const maxPair = goodPairs.reduce((best, p) => {
      const pr = num(p?.priceUsd);
      if (pr === null) return best;
      if (!best) return p;
      const bpr = num(best?.priceUsd) ?? -Infinity;
      return pr > bpr ? p : best;
    }, null as any);

    alerts.push({
      kind: 'arb_candidate',
      ts: ev.timestamp,
      chain: chainNameFromId(ev.chain),
      wallet: ev.walletAddress,
      tokenAddress: ev.tokenAddress,
      approxBuyUsd: ev.amountUsd,
      marketCap: ev.marketCap,
      txHash: tx,
      spread: s.spread,
      minPrice: s.min,
      maxPrice: s.max,
      buyDex: minPair?.dexId,
      sellDex: maxPair?.dexId,
      minPairUrl: minPair?.url,
      maxPairUrl: maxPair?.url,
    });
  }

  // prune old seen tx (keep 3 days)
  const keepMs = 3 * 24 * 60 * 60 * 1000;
  for (const [k, v] of Object.entries(state.seenTx)) {
    if (now - v > keepMs) delete state.seenTx[k];
  }

  saveState(state);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), alerts }, null, 2));

  // stdout summary for cron logs
  console.log(JSON.stringify({ count: alerts.length, alerts: alerts.slice(0, 5) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
