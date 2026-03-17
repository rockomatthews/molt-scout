import { z } from "zod";

const PairSchema = z.object({
  chainId: z.string().optional(),
  dexId: z.string().optional(),
  url: z.string().optional(),
  priceUsd: z.string().optional().nullable(),
  liquidity: z
    .object({
      usd: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  volume: z
    .object({
      h24: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  txns: z
    .object({
      h24: z
        .object({
          buys: z.number().optional().nullable(),
          sells: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
  priceChange: z
    .object({
      h24: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

const RespSchema = z.object({
  pairs: z.array(PairSchema).optional().nullable(),
});

export type DexscreenerQuote = {
  tokenAddress: string;
  chainId?: string;
  dexId?: string;
  pairUrl?: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  txns24h: { buys: number; sells: number; total: number };
  priceChange24hPct: number;
};

type CacheItem = { ts: number; quote: DexscreenerQuote | null };
const QUOTE_CACHE = new Map<string, CacheItem>();
const QUOTE_TTL_MS = 60_000;

function pickBestBasePair(pairs: any[]): any | null {
  // Strictly prefer Base pairs. If none exist, treat as unpriced for our Base-first engine.
  const basePairs = pairs.filter((p) => String(p.chainId || "").toLowerCase() === "base");
  if (!basePairs.length) return null;

  // Score: primarily liquidity USD; lightly prefer known dexs.
  const dexBoost: Record<string, number> = {
    aerodrome: 1.05,
    uniswap: 1.03,
  };

  basePairs.sort((a, b) => {
    const liqA = Number(a?.liquidity?.usd || 0);
    const liqB = Number(b?.liquidity?.usd || 0);
    const boostA = dexBoost[String(a?.dexId || "").toLowerCase()] || 1;
    const boostB = dexBoost[String(b?.dexId || "").toLowerCase()] || 1;
    return liqB * boostB - liqA * boostA;
  });

  return basePairs[0] || null;
}

export async function fetchDexscreenerQuote(tokenAddress: string): Promise<DexscreenerQuote | null> {
  const key = tokenAddress.toLowerCase();
  const cached = QUOTE_CACHE.get(key);
  if (cached && Date.now() - cached.ts < QUOTE_TTL_MS) return cached.quote;

  const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  const res = await fetch(url, { headers: { "user-agent": "alpha-engine" } });
  if (!res.ok) {
    QUOTE_CACHE.set(key, { ts: Date.now(), quote: null });
    return null;
  }
  const json = RespSchema.parse(await res.json());
  const pairs = (json.pairs || []).filter(Boolean) as any[];

  const p = pickBestBasePair(pairs);
  if (!p) {
    QUOTE_CACHE.set(key, { ts: Date.now(), quote: null });
    return null;
  }

  const px = p?.priceUsd ? Number(p.priceUsd) : NaN;
  const liq = Number(p?.liquidity?.usd || 0);
  if (!Number.isFinite(px) || px <= 0) {
    QUOTE_CACHE.set(key, { ts: Date.now(), quote: null });
    return null;
  }

  const vol24 = Number(p?.volume?.h24 || 0);
  const buys24 = Number(p?.txns?.h24?.buys || 0);
  const sells24 = Number(p?.txns?.h24?.sells || 0);
  const pc24 = Number(p?.priceChange?.h24 || 0);

  const out: DexscreenerQuote = {
    tokenAddress,
    chainId: p.chainId,
    dexId: p.dexId,
    pairUrl: p.url,
    priceUsd: px,
    liquidityUsd: Number.isFinite(liq) ? liq : 0,
    volume24hUsd: Number.isFinite(vol24) ? vol24 : 0,
    txns24h: {
      buys: Number.isFinite(buys24) ? buys24 : 0,
      sells: Number.isFinite(sells24) ? sells24 : 0,
      total: (Number.isFinite(buys24) ? buys24 : 0) + (Number.isFinite(sells24) ? sells24 : 0),
    },
    priceChange24hPct: Number.isFinite(pc24) ? pc24 : 0,
  };

  QUOTE_CACHE.set(key, { ts: Date.now(), quote: out });
  return out;
}

export async function fetchDexscreenerPriceUsd(tokenAddress: string): Promise<number | null> {
  const q = await fetchDexscreenerQuote(tokenAddress);
  return q?.priceUsd ?? null;
}
