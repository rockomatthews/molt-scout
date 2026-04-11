import { scratchpadAppend } from './scratchpad.js';
import { fetchOkxCandles, fetchOkxMarkPrice, calcAtrPct } from './okx_public.js';
import { fetchOkxSwapTickers, pickTopSwapsByVolume } from './okx_universe.js';
import { appendOkxJournal, fmtIso } from './okx_journal.js';

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
  cooldownUntilIsoByInstId?: Record<string, string>; // instId -> ISO
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
  const paper: OkxPaperState = opts.state.okxPaper || { cashUsd: 3_000, positions: {}, cooldownUntilIsoByInstId: {} };
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

      // Cooldown after stop to avoid immediate re-entry churn.
      // Default 60 minutes if not configured.
      const cooldownMin = Number((opts.okx as any).cooldownAfterStopMinutes || 60);
      const until = new Date(now.getTime() + cooldownMin * 60000).toISOString();
      paper.cooldownUntilIsoByInstId = paper.cooldownUntilIsoByInstId || {};
      paper.cooldownUntilIsoByInstId[instId] = until;

      await scratchpadAppend(opts.sp.path, {
        type: 'result',
        ts: new Date().toISOString(),
        runId: opts.sp.runId,
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `stop_${opts.okx.stopLossPct}%`, side: pos.side, cooldownUntilIso: until },
      } as any);
      await appendOkxJournal(opts.root, `- [${fmtIso(new Date())}] EXIT okx ${instId} ${pos.side} · pnlUsd $${(((opts.risk.usdPerTrade * p) / 100)).toFixed(2)} · pnlPct ${p.toFixed(2)}% · reason stop_${opts.okx.stopLossPct}% · cooldownUntil ${until} · tradeId ${(pos as any).tradeId}`);
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
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `tp_${opts.okx.takeProfitPct}%`, side: pos.side },
      } as any);
      await appendOkxJournal(opts.root, `- [${fmtIso(new Date())}] EXIT okx ${instId} ${pos.side} · pnlUsd $${(((opts.risk.usdPerTrade * p) / 100)).toFixed(2)} · pnlPct ${p.toFixed(2)}% · reason tp_${opts.okx.takeProfitPct}% · tradeId ${(pos as any).tradeId}`);
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
        data: { kind: 'okx_paper_exit', instId, tradeId: (pos as any).tradeId, px, pnlPct: p, pnlUsd: (opts.risk.usdPerTrade * p) / 100, reason: `trail_${opts.okx.trailFromPeakPct}%`, side: pos.side },
      } as any);
      await appendOkxJournal(opts.root, `- [${fmtIso(new Date())}] EXIT okx ${instId} ${pos.side} · pnlUsd $${(((opts.risk.usdPerTrade * p) / 100)).toFixed(2)} · pnlPct ${p.toFixed(2)}% · reason trail_${opts.okx.trailFromPeakPct}% · tradeId ${(pos as any).tradeId}`);
      continue;
    }

    // minimum hold time before any time-based recycling (avoid instant churn)
    if (ageMin < opts.okx.minHoldMinutes) continue;
  }

  // Entries
  // Universe selection
  const requestedInstIds = (() => {
    const topN = Number((opts.okx as any).dynamicTopN || 0);
    if (topN > 0) return null; // dynamic
    return Array.isArray(opts.okx.instIds) ? opts.okx.instIds : [];
  })();

  const instIds = requestedInstIds ?? pickTopSwapsByVolume(await fetchOkxSwapTickers(), Number((opts.okx as any).dynamicTopN || 0));

  // Validate instrument ids quickly: keep only those with a mark price.
  // This lets us stuff a big alt universe in config without breaking runs.
  const validInstIds: string[] = [];
  for (const instId of instIds) {
    const px = await fetchOkxMarkPrice({ instId });
    if (px) validInstIds.push(instId);
  }

  const diag: Record<string, number> = {
    insts: validInstIds.length,
    skipped_already_held: 0,
    skipped_cooldown: 0,
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

    const cdIso = paper.cooldownUntilIsoByInstId?.[instId];
    if (cdIso && new Date(cdIso).getTime() > now.getTime()) {
      diag.skipped_cooldown++;
      continue;
    }

    const candles = await fetchOkxCandles({ instId, bar: opts.okx.bar, limit: opts.okx.limit });
    if (candles.length < Math.max(30, opts.okx.breakoutLookback + 2)) continue;

    const atrPct = calcAtrPct(candles, 14) ?? 0;

    // Regime gates: skip too-chaotic and too-dead markets.
    const atrMax = opts.okx.atrMaxPct;
    const atrMin = Number((opts.okx as any).atrMinPct || 0);
    if (atrPct > atrMax || atrPct < atrMin) {
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

    // Journal: record a compact thesis so we can learn from outcomes.
    await appendOkxJournal(
      opts.root,
      `- [${fmtIso(new Date())}] ENTRY okx ${c.instId} ${c.side} · entryPx $${c.px} · usd $${opts.risk.usdPerTrade} · lev ${opts.okx.leverage} · atrPct ${c.atrPct.toFixed(3)} · breakoutLookback ${opts.okx.breakoutLookback} · tradeId ${tradeId}`
    );
  }

  await scratchpadAppend(opts.sp.path, {
    type: 'result',
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: 'okx_paper_diag', diag },
  } as any);
}
