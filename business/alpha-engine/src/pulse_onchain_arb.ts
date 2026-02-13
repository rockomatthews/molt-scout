import fs from 'node:fs';
import path from 'node:path';
import { getPulseTokenTransactions } from './pulse.js';
import { fetchPairInfo, quoteFromReserves, fmt } from './onchain_pools.js';

const BASE_CHAIN_ID = '8453';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;

const OUT_PATH = path.resolve('logs/pulse_onchain_arb_alerts.json');
const STATE_PATH = path.resolve('state.pulse_onchain_arb.json');

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

function pct(a: number, b: number) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  if (!Number.isFinite(min) || min <= 0) return 0;
  return (max - min) / min;
}

async function main() {
  const state = loadState();
  const now = Date.now();

  const amountMinUsd = Number(process.env.PULSE_AMOUNT_MIN_USD ?? '200');
  const marketCapMaxUsd = Number(process.env.PULSE_MARKETCAP_MAX_USD ?? '20000000');
  const minLiquidityUsd = Number(process.env.ARB_MIN_LIQ_USD ?? '5000');
  const minEdge = Number(process.env.ARB_MIN_SPREAD ?? '0.003'); // 0.3%
  const quoteUsdc = Number(process.env.QUOTE_USDC ?? '100');

  const pulse = await getPulseTokenTransactions({
    amountMinUsd,
    marketCapMaxUsd,
    limit: 50,
    offset: 0,
    onlyWithProfile: true,
  });

  const alerts: any[] = [];

  for (const ev of pulse) {
    if (ev.chain !== BASE_CHAIN_ID) continue;
    if (!ev.tokenAddress || !ev.hash) continue;

    const key = `${ev.tokenAddress.toLowerCase()}:${ev.hash}`;
    if (state.seen[key]) continue;
    state.seen[key] = now;

    let ds: any;
    try {
      ds = await fetchDexscreenerToken(ev.tokenAddress);
    } catch {
      continue;
    }

    const pairs: any[] = Array.isArray(ds?.pairs) ? ds.pairs : [];
    const basePairs = pairs.filter((p) => (p?.chainId ?? '').toLowerCase() === 'base');

    // candidate pools must include USDC as either base or quote token, and have decent liquidity
    const cand = basePairs
      .filter((p) => {
        const liq = num(p?.liquidity?.usd) ?? 0;
        if (liq < minLiquidityUsd) return false;
        const a = String(p?.baseToken?.address ?? '').toLowerCase();
        const b = String(p?.quoteToken?.address ?? '').toLowerCase();
        return a === USDC_BASE.toLowerCase() || b === USDC_BASE.toLowerCase();
      })
      .slice(0, 6);

    if (cand.length < 2) continue;

    // Onchain quote: USDC -> token using reserves (volatile pools only)
    const quotes: { dexId?: string; pairAddress: string; outToken: number; url?: string }[] = [];

    for (const p of cand) {
      const pairAddress = String(p?.pairAddress ?? p?.pairAddress ?? '').trim();
      if (!pairAddress.startsWith('0x') || pairAddress.length !== 42) continue;

      let info;
      try {
        info = await fetchPairInfo(pairAddress as any);
      } catch {
        continue;
      }

      if (info.stable) continue; // skip stable curve pools for now

      const token0 = info.token0;
      const token1 = info.token1;
      const tokenAddr = ev.tokenAddress as any;

      const out = quoteFromReserves({
        amountInFloat: quoteUsdc,
        amountInDecimals: USDC_DECIMALS,
        tokenIn: USDC_BASE as any,
        tokenOut: tokenAddr,
        token0,
        token1,
        reserve0: info.reserve0,
        reserve1: info.reserve1,
        feeBps: 30,
      });

      if (out === null) continue;

      // token decimals: try from dexscreener baseToken.decimals
      const tokenDecimals = num(p?.baseToken?.address?.toLowerCase() === tokenAddr.toLowerCase() ? p?.baseToken?.decimals : p?.quoteToken?.decimals) ?? 18;
      const outFloat = fmt(out, tokenDecimals);
      if (!Number.isFinite(outFloat) || outFloat <= 0) continue;

      quotes.push({ dexId: p?.dexId, pairAddress, outToken: outFloat, url: p?.url });
    }

    if (quotes.length < 2) continue;

    quotes.sort((a, b) => a.outToken - b.outToken);
    const worst = quotes[0];
    const best = quotes[quotes.length - 1];
    const edge = pct(best.outToken, worst.outToken);

    if (edge < minEdge) continue;

    alerts.push({
      kind: 'onchain_reserve_quote_edge',
      ts: ev.timestamp,
      wallet: ev.walletAddress,
      txHash: ev.hash,
      tokenAddress: ev.tokenAddress,
      quoteUsdc,
      best: best,
      worst: worst,
      edge,
      approxBuyUsd: ev.amountUsd,
      marketCap: ev.marketCap,
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
