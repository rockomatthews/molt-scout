export type HlMeta = { universe: { name: string; szDecimals: number; maxLeverage: number }[] };
export type HlAssetCtx = {
  funding: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  impactPxs?: [string, string];
};

export async function hlInfo<T>(body: any): Promise<T> {
  const res = await fetch('https://api.hyperliquid.xyz/info', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`hyperliquid info http ${res.status}`);
  return res.json();
}

export async function getMetaAndAssetCtxs(): Promise<[HlMeta, HlAssetCtx[]]> {
  return hlInfo({ type: 'metaAndAssetCtxs' });
}
