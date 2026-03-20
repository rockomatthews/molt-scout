import { z } from "zod";

const OhlcvResp = z.object({
  data: z.object({
    attributes: z.object({
      ohlcv_list: z.array(z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()])),
    }),
  }),
});

export type OhlcvCandle = { t: number; o: number; h: number; l: number; c: number; v: number };

export async function fetchBestPoolForTokenBase(tokenAddress: string): Promise<string | null> {
  const url = `https://api.geckoterminal.com/api/v2/networks/base/tokens/${tokenAddress}/pools?page=1`;
  const res = await fetch(url, { headers: { accept: "application/json;version=20230203", "user-agent": "alpha-engine" } });
  if (!res.ok) return null;
  const json: any = await res.json().catch(() => null);
  const pools = json?.data;
  if (!Array.isArray(pools) || !pools.length) return null;

  // Pick highest reserve_in_usd if available
  pools.sort((a: any, b: any) => Number(b?.attributes?.reserve_in_usd || 0) - Number(a?.attributes?.reserve_in_usd || 0));
  const id = String(pools[0]?.id || "");
  // id format: base_0x...
  const m = id.match(/^base_(0x[a-fA-F0-9]{40})$/);
  return m ? m[1].toLowerCase() : null;
}

export async function fetchPoolOhlcvBase(opts: { poolAddress: string; timeframe: "minute" | "hour" | "day"; aggregate: number; limit: number; }): Promise<OhlcvCandle[]> {
  const url = `https://api.geckoterminal.com/api/v2/networks/base/pools/${opts.poolAddress}/ohlcv/${opts.timeframe}?aggregate=${opts.aggregate}&limit=${opts.limit}`;
  const res = await fetch(url, { headers: { accept: "application/json;version=20230203", "user-agent": "alpha-engine" } });
  if (!res.ok) return [];
  const parsed = OhlcvResp.safeParse(await res.json());
  if (!parsed.success) return [];
  const list = parsed.data.data.attributes.ohlcv_list;
  // GeckoTerminal returns newest-first; reverse to ascending
  return list
    .slice()
    .reverse()
    .map(([t, o, h, l, c, v]) => ({ t, o, h, l, c, v }));
}

export function calcRsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += -diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calcSma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}
