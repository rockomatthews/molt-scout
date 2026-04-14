import { scratchpadAppend } from "./scratchpad.js";
import { hlAllMids, hlMetaAndAssetCtxs, hlFundingHistory } from "./hyperliquid_info.js";

export type HlPaperPosition = {
  coin: string;
  side: "long" | "short";
  usd: number;
  entryPx: number;
  openedAtIso: string;
  peakPnlPct?: number;
};

export type HlPaperState = {
  cashUsd: number;
  positions: Record<string, HlPaperPosition>; // coin -> position
};

function pnlPct(pos: HlPaperPosition, px: number) {
  const ret = (px - pos.entryPx) / pos.entryPx;
  return pos.side === "long" ? ret * 100 : -ret * 100;
}

export async function runHyperliquidPaper(opts: {
  root: string;
  sp: { path: string; runId: string };
  state: any;
  risk: { usdPerTrade: number; maxTotalExposureUsd: number; maxDailyLossUsd: number };
  hl: { enabled: boolean; startCashUsd: number; maxPositions: number };
}) {
  if (!opts.hl.enabled) return;

  const now = new Date();
  const paper: HlPaperState = opts.state.hlPaper || { cashUsd: opts.hl.startCashUsd || 20_000, positions: {} };
  opts.state.hlPaper = paper;

  const mids = await hlAllMids();

  // Exits: basic stop/tp with generous bounds (we'll tune later)
  const STOP = 0.5; // %
  const TP = 1.0; // %

  for (const [coin, pos] of Object.entries(paper.positions)) {
    const pxStr = mids[coin];
    if (!pxStr) continue;
    const px = Number(pxStr);
    if (!Number.isFinite(px) || px <= 0) continue;

    const p = pnlPct(pos, px);
    const prevPeak = typeof pos.peakPnlPct === "number" ? pos.peakPnlPct : p;
    pos.peakPnlPct = Math.max(prevPeak, p);

    if (p <= -Math.abs(STOP) || p >= Math.abs(TP)) {
      paper.cashUsd += pos.usd + (pos.usd * p) / 100;
      opts.state.realizedPnlUsd += (pos.usd * p) / 100;
      opts.state.totalExposureUsd -= pos.usd;
      delete paper.positions[coin];

      await scratchpadAppend(opts.sp.path, {
        type: "result",
        ts: new Date().toISOString(),
        runId: opts.sp.runId,
        data: { kind: "hl_paper_exit", coin, side: pos.side, px, pnlPct: p, pnlUsd: (pos.usd * p) / 100, reason: p <= -STOP ? `stop_${STOP}%` : `tp_${TP}%` },
      } as any);
    }
  }

  // Entries: pick top funding coins by magnitude (simple alpha proxy)
  const { meta } = await hlMetaAndAssetCtxs();
  const universe = (meta.universe || []).map((u) => u.name).filter(Boolean);

  // sample up to 25 coins to keep API cheap
  const coins = universe.slice(0, 25);
  const end = now.getTime();
  const start = end - 6 * 60 * 60 * 1000;

  const fundingScores: Array<{ coin: string; score: number }> = [];
  for (const c of coins) {
    try {
      const fh = await hlFundingHistory(c, start, end);
      const arr = Array.isArray(fh) ? fh : [];
      const last = arr[arr.length - 1];
      const fr = last ? Number(last.fundingRate ?? last.rate ?? 0) : 0;
      // want positive or negative extremes (mean reversion or momentum, we will decide later)
      fundingScores.push({ coin: c, score: Math.abs(fr) });
    } catch {
      // ignore
    }
  }

  fundingScores.sort((a, b) => b.score - a.score);

  const maxEntries = Math.min(opts.hl.maxPositions, 3);
  let entries = 0;
  for (const { coin } of fundingScores) {
    if (entries >= maxEntries) break;
    if (paper.positions[coin]) continue;
    if (Object.keys(paper.positions).length >= opts.hl.maxPositions) break;
    if (opts.state.totalExposureUsd + opts.risk.usdPerTrade > opts.risk.maxTotalExposureUsd) break;
    if (paper.cashUsd < opts.risk.usdPerTrade) break;

    const pxStr = mids[coin];
    if (!pxStr) continue;
    const px = Number(pxStr);
    if (!Number.isFinite(px) || px <= 0) continue;

    // paper entry: direction placeholder (we'll add a real signal next)
    const side: "long" | "short" = "long";

    paper.cashUsd -= opts.risk.usdPerTrade;
    paper.positions[coin] = { coin, side, usd: opts.risk.usdPerTrade, entryPx: px, openedAtIso: new Date().toISOString(), peakPnlPct: 0 };
    opts.state.totalExposureUsd += opts.risk.usdPerTrade;
    entries++;

    await scratchpadAppend(opts.sp.path, {
      type: "action",
      ts: new Date().toISOString(),
      runId: opts.sp.runId,
      data: { kind: "hl_paper_entry", coin, side, usd: opts.risk.usdPerTrade, entryPx: px, why: "top_abs_funding_6h" },
    } as any);
  }

  await scratchpadAppend(opts.sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "hl_paper_diag", holdings: Object.keys(paper.positions).length, entries },
  } as any);
}
