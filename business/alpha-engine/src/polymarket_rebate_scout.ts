/*
  Polymarket rebate scout (paper / intel)

  Skill implemented: prioritize markets where maker rebates are most efficient.
  From Polymarket docs, maker rebate weighting uses fee-equivalent:
    fee_equivalent ∝ C * feeRate * p * (1-p)

  So, holding size constant, best opportunities are:
    - fee-enabled categories
    - prices near 0.5 (maximize p*(1-p))
    - enough volume/activity to get filled

  This module is read-only and uses Gamma public API.
*/

import { scratchpadAppend } from "./scratchpad.js";

const GAMMA = "https://gamma-api.polymarket.com";

type GammaMarket = {
  question?: string;
  conditionId?: string;
  outcomePrices?: string | string[];
  volumeNum?: number;
  category?: string | null;
};

const FeeRateByCategory: Record<string, number> = {
  Crypto: 0.072,
  Sports: 0.03,
  Finance: 0.04,
  Politics: 0.04,
  Economics: 0.05,
  Culture: 0.05,
  Weather: 0.05,
  Other: 0.05,
  Mentions: 0.04,
  Tech: 0.04,
  Geopolitics: 0.0,
};

function parseOutcomePrices(v: any): number[] | null {
  if (!v) return null;
  if (Array.isArray(v)) {
    const arr = v.map((x) => Number(x)).filter((x) => Number.isFinite(x));
    return arr.length ? arr : null;
  }
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      return parseOutcomePrices(j);
    } catch {
      return null;
    }
  }
  return null;
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

export async function scoutPolymarketRebates(opts: {
  sp: { path: string; runId: string };
  limit?: number;
  minVolumeUsd?: number;
  topN?: number;
}) {
  const limit = typeof opts.limit === "number" ? opts.limit : 200;
  const minVolumeUsd = typeof opts.minVolumeUsd === "number" ? opts.minVolumeUsd : 50_000;
  const topN = typeof opts.topN === "number" ? opts.topN : 15;

  const url = `${GAMMA}/markets?closed=false&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`gamma_http_${res.status}`);
  const mkts = (await res.json()) as GammaMarket[];

  const rows: Array<{
    conditionId: string;
    question: string;
    category: string;
    pYes: number;
    volumeUsd: number;
    feeRate: number;
    rebateScore: number;
  }> = [];

  for (const m of mkts || []) {
    const conditionId = String(m.conditionId || "");
    const question = String(m.question || "");
    if (!conditionId || !question) continue;

    const prices = parseOutcomePrices(m.outcomePrices);
    if (!prices || prices.length < 2) continue;

    const pYes = clamp(Number(prices[0]), 0, 1);
    const vol = Number(m.volumeNum || 0);
    if (!Number.isFinite(vol) || vol < minVolumeUsd) continue;

    const cat = String(m.category || "Other");
    const feeRate = FeeRateByCategory[cat] ?? FeeRateByCategory.Other;
    const rebateScore = feeRate * pYes * (1 - pYes);

    rows.push({ conditionId, question, category: cat, pYes, volumeUsd: vol, feeRate, rebateScore });
  }

  rows.sort((a, b) => b.rebateScore - a.rebateScore);
  const top = rows.slice(0, topN);

  await scratchpadAppend(opts.sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "polymarket_rebate_scout", url, limit, minVolumeUsd, topN, top },
  } as any);

  return top;
}
