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
};

export async function fetchDexscreenerQuote(tokenAddress: string): Promise<DexscreenerQuote | null> {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  const res = await fetch(url, { headers: { "user-agent": "alpha-engine" } });
  if (!res.ok) return null;
  const json = RespSchema.parse(await res.json());
  const pairs = (json.pairs || []).filter(Boolean) as any[];

  const basePairs = pairs.filter((p) => String(p.chainId || "").toLowerCase() === "base");
  const pickFrom = basePairs.length ? basePairs : pairs;

  // pick highest liquidity USD
  pickFrom.sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0));
  const p = pickFrom[0];
  if (!p) return null;

  const px = p?.priceUsd ? Number(p.priceUsd) : NaN;
  const liq = Number(p?.liquidity?.usd || 0);
  if (!Number.isFinite(px) || px <= 0) return null;

  return {
    tokenAddress,
    chainId: p.chainId,
    dexId: p.dexId,
    pairUrl: p.url,
    priceUsd: px,
    liquidityUsd: Number.isFinite(liq) ? liq : 0,
  };
}

export async function fetchDexscreenerPriceUsd(tokenAddress: string): Promise<number | null> {
  const q = await fetchDexscreenerQuote(tokenAddress);
  return q?.priceUsd ?? null;
}
