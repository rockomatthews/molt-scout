import { getMetaAndAssetCtxs } from './client.js';

function n(x: string | undefined): number {
  const v = Number(x);
  return Number.isFinite(v) ? v : NaN;
}

function abs(x: number) {
  return Math.abs(x);
}

(async () => {
  const FUNDING_ABS_MIN = Number(process.env.HL_FUNDING_ABS_MIN ?? '0.00001');
  const PREMIUM_ABS_MIN = Number(process.env.HL_PREMIUM_ABS_MIN ?? '0.001');

  const [meta, ctxs] = await getMetaAndAssetCtxs();

  const rows = meta.universe.map((a, i) => {
    const c = ctxs[i];
    const funding = n(c?.funding);
    const premium = n(c?.premium);
    const oraclePx = n(c?.oraclePx);
    const markPx = n(c?.markPx);
    const midPx = n(c?.midPx);
    return {
      coin: a.name,
      funding,
      premium,
      oraclePx,
      markPx,
      midPx,
      openInterest: n(c?.openInterest),
      dayNtlVlm: n(c?.dayNtlVlm),
    };
  });

  const topFunding = rows
    .filter((r) => Number.isFinite(r.funding) && abs(r.funding) >= FUNDING_ABS_MIN)
    .sort((a, b) => abs(b.funding) - abs(a.funding))
    .slice(0, 10);

  const topPremium = rows
    .filter((r) => Number.isFinite(r.premium) && abs(r.premium) >= PREMIUM_ABS_MIN)
    .sort((a, b) => abs(b.premium) - abs(a.premium))
    .slice(0, 10);

  const signal = {
    generatedAt: new Date().toISOString(),
    thresholds: { FUNDING_ABS_MIN, PREMIUM_ABS_MIN },
    topFunding,
    topPremium,
  };

  console.log(JSON.stringify(signal, null, 2));
})();
