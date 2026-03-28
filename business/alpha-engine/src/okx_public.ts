type OkxCandle = { ts: number; o: number; h: number; l: number; c: number; v: number };

function okxBarToMs(bar: string) {
  // OKX uses strings like "1m", "5m", "15m", "1H", "4H", "1D".
  const m = String(bar).match(/^(\d+)(m|H|D)$/);
  if (!m) return 60_000;
  const n = Number(m[1]);
  const u = m[2];
  if (u === 'm') return n * 60_000;
  if (u === 'H') return n * 3_600_000;
  if (u === 'D') return n * 86_400_000;
  return 60_000;
}

export async function fetchOkxCandles(opts: { instId: string; bar: string; limit: number }): Promise<OkxCandle[]> {
  const url = `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(opts.instId)}&bar=${encodeURIComponent(opts.bar)}&limit=${encodeURIComponent(String(opts.limit))}`;
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'alpha-engine' } });
  if (!res.ok) return [];
  const json: any = await res.json().catch(() => null);
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  // OKX candles are newest-first; convert to ascending.
  const out = rows
    .map((r) => {
      const ts = Number(r?.[0]);
      const o = Number(r?.[1]);
      const h = Number(r?.[2]);
      const l = Number(r?.[3]);
      const c = Number(r?.[4]);
      const v = Number(r?.[5]);
      if (!Number.isFinite(ts) || !Number.isFinite(c)) return null;
      return { ts, o, h, l, c, v } as OkxCandle;
    })
    .filter(Boolean) as OkxCandle[];

  out.sort((a, b) => a.ts - b.ts);

  // Sometimes OKX returns gaps; keep as-is.
  return out;
}

export async function fetchOkxMarkPrice(opts: { instId: string }): Promise<number | null> {
  const url = `https://www.okx.com/api/v5/public/mark-price?instType=SWAP&instId=${encodeURIComponent(opts.instId)}`;
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'alpha-engine' } });
  if (!res.ok) return null;
  const json: any = await res.json().catch(() => null);
  const row = Array.isArray(json?.data) ? json.data[0] : null;
  const px = Number(row?.markPx);
  return Number.isFinite(px) && px > 0 ? px : null;
}

export function calcAtrPct(candles: OkxCandle[], period = 14): number | null {
  if (candles.length < period + 1) return null;
  const slice = candles.slice(-period - 1);
  const trs: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    const prev = slice[i - 1];
    const cur = slice[i];
    const tr = Math.max(cur.h - cur.l, Math.abs(cur.h - prev.c), Math.abs(cur.l - prev.c));
    trs.push(tr);
  }
  const atr = trs.reduce((a, b) => a + b, 0) / trs.length;
  const last = slice[slice.length - 1].c;
  if (!Number.isFinite(last) || last <= 0) return null;
  return (atr / last) * 100;
}

export function okxBarMs(bar: string) {
  return okxBarToMs(bar);
}
