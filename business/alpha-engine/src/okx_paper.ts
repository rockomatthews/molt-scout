import { scratchpadAppend } from './scratchpad.js';
import { fetchOkxCandles, fetchOkxMarkPrice, calcAtrPct } from './okx_public.js';

export type OkxPaperPosition = {
  instId: string;
  side: 'long' | 'short';
  qty: number; // contract qty (we treat 1 qty as 1 USD notional for paper simplicity)
  avgEntry: number;
  openedAtIso: string;
  peakPnlPct?: number;
};

export type OkxPaperState = {
  cashUsd: number;
  positions: Record<string, OkxPaperPosition>; // instId -> position
};

function pnlPct(pos: OkxPaperPosition, px: number) {
  const ret = (px - pos.avgEntry) / pos.avgEntry;
  return pos.side === 'long' ? ret * 100 : -ret * 100;
}

export async function runOkxPaperTrading(opts: {
  root: string;
  sp: { path: string; runId: string };
  state: any;
  risk: { usdPerTrade: number; maxTotalExposureUsd: number; maxDailyLossUsd: number };
  okx: {
    enabled: boolean;
    instIds: string[];
    bar: string; // e.g. 1m, 5m
    limit: number;
    leverage: number;
    maxPositions: number;
    maxEntriesPerRun: number;
    // signal params
    breakoutLookback: number; // candles
    atrMaxPct: number; // avoid insane vol
    takeProfitPct: number;
    stopLossPct: number;
    trailFromPeakPct: number;
    minHoldMinutes: number;
  };
}) {
  if (!opts.okx.enabled) return;

  const now = new Date();
  const paper: OkxPaperState = opts.state.okxPaper || { cashUsd: 3_000, positions: {} };
  opts.state.okxPaper = paper;

  // Exits first
  for (const [instId, pos] of Object.entries(paper.positions)) {
    const px = await fetchOkxMarkPrice({ instId });
    if (!px) continue;

    const opened = new Date(pos.openedAtIso).getTime();
    const ageMin = (now.getTime() - opened) / 60000;

    const p = pnlPct(pos, px);
    const prevPeak = typeof pos.peakPnlPct === 'number' ? pos.peakPnlPct : p;
    pos.peakPnlPct = Math.max(prevPeak, p);

    // stop/tp
    if (p <= -Math.abs(opts.okx.stopLossPct)) {
      paper.cashUsd += opts.risk.usdPerTrade + (opts.risk.usdPerTrade * p) / 100;
      opts.state.realizedPnlUsd += (opts.risk.usdPerTrade * p) / 100;
      opts.state.totalExposureUsd -= opts.risk.usdPerTrade;
      delete paper.positions[instId];
      await scratchpadAppend(opts.sp.path, {
        type: 'result',
        ts: new Date().toISOString(),
        runId: opts.sp.runId,
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `stop_${opts.okx.stopLossPct}%` },
      } as any);
      continue;
    }
    if (p >= Math.abs(opts.okx.takeProfitPct)) {
      paper.cashUsd += opts.risk.usdPerTrade + (opts.risk.usdPerTrade * p) / 100;
      opts.state.realizedPnlUsd += (opts.risk.usdPerTrade * p) / 100;
      opts.state.totalExposureUsd -= opts.risk.usdPerTrade;
      delete paper.positions[instId];
      await scratchpadAppend(opts.sp.path, {
        type: 'result',
        ts: new Date().toISOString(),
        runId: opts.sp.runId,
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `tp_${opts.okx.takeProfitPct}%` },
      } as any);
      continue;
    }

    // trail after some profit
    if (pos.peakPnlPct >= 0.5 && p <= pos.peakPnlPct - Math.abs(opts.okx.trailFromPeakPct)) {
      paper.cashUsd += opts.risk.usdPerTrade + (opts.risk.usdPerTrade * p) / 100;
      opts.state.realizedPnlUsd += (opts.risk.usdPerTrade * p) / 100;
      opts.state.totalExposureUsd -= opts.risk.usdPerTrade;
      delete paper.positions[instId];
      await scratchpadAppend(opts.sp.path, {
        type: 'result',
        ts: new Date().toISOString(),
        runId: opts.sp.runId,
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `trail_${opts.okx.trailFromPeakPct}%` },
      } as any);
      continue;
    }

    // minimum hold time before any time-based recycling (avoid instant churn)
    if (ageMin < opts.okx.minHoldMinutes) continue;
  }

  // Entries
  // Validate instrument ids quickly: keep only those with a mark price.
  // This lets us stuff a big alt universe in config without breaking runs.
  const validInstIds: string[] = [];
  for (const instId of opts.okx.instIds) {
    const px = await fetchOkxMarkPrice({ instId });
    if (px) validInstIds.push(instId);
  }

  const diag: Record<string, number> = {
    insts: validInstIds.length,
    skipped_already_held: 0,
    skipped_exposure_cap: 0,
    skipped_cash: 0,
    skipped_atr: 0,
    entries: 0,
  };

  const candidates: Array<{ instId: string; side: 'long' | 'short'; score: number; px: number; atrPct: number }> = [];

  for (const instId of validInstIds) {
    if (paper.positions[instId]) {
      diag.skipped_already_held++;
      continue;
    }

    const candles = await fetchOkxCandles({ instId, bar: opts.okx.bar, limit: opts.okx.limit });
    if (candles.length < Math.max(30, opts.okx.breakoutLookback + 2)) continue;

    const atrPct = calcAtrPct(candles, 14) ?? 0;
    if (atrPct > opts.okx.atrMaxPct) {
      diag.skipped_atr++;
      continue;
    }

    const closes = candles.map((c) => c.c);
    const last = closes[closes.length - 1];
    const lb = opts.okx.breakoutLookback;
    const prior = closes.slice(closes.length - lb - 1, closes.length - 1);
    const hi = Math.max(...prior);
    const lo = Math.min(...prior);

    // Breakout signal: trade direction of breakout.
    let side: 'long' | 'short' | null = null;
    if (last > hi) side = 'long';
    else if (last < lo) side = 'short';
    if (!side) continue;

    // Score: stronger breakout distance / lower vol
    const dist = side === 'long' ? (last - hi) / hi : (lo - last) / lo;
    const score = dist * 1000 + Math.max(0, 10 - atrPct);

    candidates.push({ instId, side, score, px: last, atrPct });
  }

  candidates.sort((a, b) => b.score - a.score);

  const maxEntries = Math.min(opts.okx.maxEntriesPerRun, opts.okx.maxPositions);
  for (const c of candidates) {
    if (diag.entries >= maxEntries) break;
    if (opts.state.totalExposureUsd + opts.risk.usdPerTrade > opts.risk.maxTotalExposureUsd) {
      diag.skipped_exposure_cap++;
      break;
    }
    if (paper.cashUsd < opts.risk.usdPerTrade) {
      diag.skipped_cash++;
      break;
    }

    paper.cashUsd -= opts.risk.usdPerTrade;
    const tradeId = `${opts.sp.runId}:${c.instId}:${Date.now()}`;
    paper.positions[c.instId] = {
      instId: c.instId,
      side: c.side,
      qty: opts.risk.usdPerTrade * (opts.okx.leverage || 1),
      avgEntry: c.px,
      openedAtIso: new Date().toISOString(),
      peakPnlPct: 0,
      ...( { tradeId } as any ),
    };

    opts.state.totalExposureUsd += opts.risk.usdPerTrade;
    diag.entries++;

    await scratchpadAppend(opts.sp.path, {
      type: 'action',
      ts: new Date().toISOString(),
      runId: opts.sp.runId,
      data: { kind: 'okx_paper_entry', tradeId, instId: c.instId, side: c.side, entryPx: c.px, usd: opts.risk.usdPerTrade, leverage: opts.okx.leverage, atrPct: c.atrPct, score: c.score },
    } as any);
  }

  await scratchpadAppend(opts.sp.path, {
    type: 'result',
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: 'okx_paper_diag', diag },
  } as any);
}
