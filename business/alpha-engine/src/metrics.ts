export type EquityPoint = { ts: string; equityUsd: number };

export function maxDrawdownPct(series: EquityPoint[]): number {
  let peak = -Infinity;
  let maxDd = 0;
  for (const p of series) {
    if (!Number.isFinite(p.equityUsd)) continue;
    if (p.equityUsd > peak) peak = p.equityUsd;
    if (peak > 0) {
      const dd = (p.equityUsd - peak) / peak;
      if (dd < maxDd) maxDd = dd;
    }
  }
  return maxDd * 100;
}

// Sortino ratio using per-step returns and downside deviation.
// This is a lightweight implementation for daily scoreboards.
export function sortinoRatio(series: EquityPoint[], rfPerStep = 0): number {
  if (series.length < 3) return 0;
  const rets: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].equityUsd;
    const cur = series[i].equityUsd;
    if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev <= 0) continue;
    rets.push(cur / prev - 1);
  }
  if (!rets.length) return 0;

  const excess = rets.map((r) => r - rfPerStep);
  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const downside = excess.filter((r) => r < 0);
  if (!downside.length) return mean > 0 ? 999 : 0;
  const dd = Math.sqrt(downside.reduce((a, b) => a + b * b, 0) / downside.length);
  if (dd === 0) return 0;
  return mean / dd;
}
