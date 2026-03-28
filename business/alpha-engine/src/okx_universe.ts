export type OkxSwapTicker = {
  instId: string;
  last: number;
  volCcy24h: number; // quote volume (usually USDT)
};

export async function fetchOkxSwapTickers(): Promise<OkxSwapTicker[]> {
  const url = `https://www.okx.com/api/v5/market/tickers?instType=SWAP`;
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'alpha-engine' } });
  if (!res.ok) return [];
  const json: any = await res.json().catch(() => null);
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map((r) => {
      const instId = String(r?.instId || '');
      const last = Number(r?.last);
      const volCcy24h = Number(r?.volCcy24h);
      if (!instId || !Number.isFinite(last) || !Number.isFinite(volCcy24h)) return null;
      return { instId, last, volCcy24h } as OkxSwapTicker;
    })
    .filter(Boolean) as OkxSwapTicker[];
}

export function pickTopSwapsByVolume(tickers: OkxSwapTicker[], topN: number): string[] {
  return tickers
    .slice()
    .sort((a, b) => b.volCcy24h - a.volCcy24h)
    .slice(0, Math.max(0, topN))
    .map((t) => t.instId);
}
