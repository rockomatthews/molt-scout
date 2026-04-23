/*
  Polymarket paper market-maker simulator (paper-only)

  Goal: take candidate markets (from polymarket_rebate_scout) and simulate a
  simple symmetric quoting strategy around mid price (pYes).

  This is NOT execution code, there is no signing, and no API trading.

  Model notes (intentionally simple):
  - Each refresh step we quote YES at (pYes - halfSpread) and NO at (pNo - halfSpread).
    (Equivalently we quote both outcomes at a discount vs their mids.)
  - Fills arrive stochastically based on volumeUsd, scaled by refreshSeconds.
  - When filled, we trade a fixed size (tradeSizeShares) subject to inventory caps.
  - PnL is tracked two ways:
      1) cash + inventory mark-to-mid (mark-to-mid)
      2) spread capture proxy (vs mid at time of fill)
  - Estimated maker rebate weight proxy:
      fee_equivalent = shares * feeRate * p * (1 - p)

  Parameter grid quick intuition:
  - quoteHalfSpread: tighter -> more fills, lower edge; wider -> fewer fills, more edge.
      Suggested default: 0.005 (0.5 probability points)
  - refreshSeconds: smaller -> more quote opportunities, more fills (linearly in this model).
      Suggested default: 15s
  - maxInventorySharesPerSide: too small -> you stop quoting one side often.
      Suggested default: 200 shares
  - tradeSizeShares: larger -> higher variance, can hit inventory caps quickly.
      Suggested default: 20 shares
*/

import path from "node:path";
import { scoutPolymarketRebates } from "./polymarket_rebate_scout.js";
import { scratchpadAppend, scratchpadInit } from "./scratchpad.js";

export type PaperMMMarket = {
  conditionId: string;
  question: string;
  pYes: number;
  volumeUsd: number;
  feeRate: number;
};

export type PaperMMParams = {
  quoteHalfSpread: number; // probability points
  refreshSeconds: number;
  maxInventorySharesPerSide: number;
  tradeSizeShares: number;
  simMinutes: number;
  // Inventory-skewed quoting: shift quotes based on net inventory.
  // 0 disables skew. Typical: 0.0005 to 0.002.
  inventorySkewPerShare?: number;
  seed?: number;
};

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

// Simple deterministic PRNG for reproducible runs.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fillProbPerStep(volumeUsd: number, refreshSeconds: number) {
  // Heuristic: convert volume to a per-minute intensity, then to per-step probability.
  // Calibrated to keep probabilities reasonable across ~50k to several million.
  // volumeFactor in [0,1] via log scaling.
  const v = Math.max(0, volumeUsd);
  const logv = Math.log10(Math.max(1, v));
  const volumeFactor = clamp((logv - 4.7) / (7.0 - 4.7), 0, 1); // ~50k..10M

  const basePerMinute = 0.05; // low baseline
  const maxPerMinute = 0.70; // at very high volume
  const perMinute = basePerMinute + (maxPerMinute - basePerMinute) * volumeFactor;

  const p = 1 - Math.exp(-perMinute * (refreshSeconds / 60));
  return clamp(p, 0, 0.95);
}

type MarketState = {
  invYes: number;
  invNo: number;
  cash: number;
  fillsYes: number;
  fillsNo: number;
  spreadPnl: number;
  feeEquivalent: number;
};

type PaperAccount = {
  startCashUsd: number;
  cashUsd: number;
};

export async function runPaperPolymarketMM(opts: {
  root: string;
  sp?: { path: string; runId: string };
  markets: PaperMMMarket[];
  params: PaperMMParams;
  account?: { startCashUsd?: number };
  // Optional persisted state injection.
  state?: {
    cashUsd: number;
    positions: Record<string, { invYes: number; invNo: number }>;
  };
}) {
  const sp = opts.sp ?? (await scratchpadInit(opts.root, { kind: "polymarket_paper_mm" }));

  const seed = typeof opts.params.seed === "number" ? opts.params.seed : Date.now() >>> 0;
  const rng = mulberry32(seed);

  await scratchpadAppend(sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: { kind: "polymarket_paper_mm", seed, params: opts.params, markets: opts.markets },
  } as any);

  const steps = Math.max(1, Math.floor((opts.params.simMinutes * 60) / opts.params.refreshSeconds));

  const startCashUsd = typeof opts.account?.startCashUsd === "number" ? opts.account!.startCashUsd! : 20_000;
  const account: PaperAccount = {
    startCashUsd,
    cashUsd: typeof opts.state?.cashUsd === "number" ? opts.state!.cashUsd : startCashUsd,
  };

  const byId = new Map<string, { m: PaperMMMarket; s: MarketState }>();
  for (const m of opts.markets) {
    const ps = opts.state?.positions?.[m.conditionId];
    byId.set(m.conditionId, {
      m,
      s: {
        invYes: typeof ps?.invYes === "number" ? ps!.invYes : 0,
        invNo: typeof ps?.invNo === "number" ? ps!.invNo : 0,
        cash: 0,
        fillsYes: 0,
        fillsNo: 0,
        spreadPnl: 0,
        feeEquivalent: 0,
      },
    });
  }

  for (let t = 0; t < steps; t++) {
    for (const { m, s } of byId.values()) {
      const pYes = clamp(m.pYes, 0, 1);
      const pNo = 1 - pYes;
      const hs = Math.max(0, opts.params.quoteHalfSpread);

      // Inventory skew: if we are long YES (or NO), worsen the quote for adding more
      // and improve the opposite side to encourage rebalancing.
      const skewPerShare = Math.max(0, Number(opts.params.inventorySkewPerShare || 0));
      const netYesMinusNo = s.invYes - s.invNo;
      const skew = netYesMinusNo * skewPerShare;

      // If net long YES, decrease YES bid (pay less) and increase NO bid (pay more).
      // If net long NO, the opposite.
      const qYes = clamp(pYes - hs - skew, 0.0001, 0.9999);
      const qNo = clamp(pNo - hs + skew, 0.0001, 0.9999);

      const pFill = fillProbPerStep(m.volumeUsd, opts.params.refreshSeconds);

      // Try a YES fill
      if (rng() < pFill) {
        if (s.invYes + opts.params.tradeSizeShares <= opts.params.maxInventorySharesPerSide) {
          const size = opts.params.tradeSizeShares;
          const cost = size * qYes;
          if (account.cashUsd - cost >= 0) {
            s.invYes += size;
            s.cash -= cost;
            account.cashUsd -= cost;
            s.fillsYes += 1;
            s.spreadPnl += size * (pYes - qYes);
            s.feeEquivalent += size * m.feeRate * pYes * (1 - pYes);
          }
        }
      }

      // Try a NO fill
      if (rng() < pFill) {
        if (s.invNo + opts.params.tradeSizeShares <= opts.params.maxInventorySharesPerSide) {
          const size = opts.params.tradeSizeShares;
          const cost = size * qNo;
          if (account.cashUsd - cost >= 0) {
            s.invNo += size;
            s.cash -= cost;
            account.cashUsd -= cost;
            s.fillsNo += 1;
            s.spreadPnl += size * (pNo - qNo);
            s.feeEquivalent += size * m.feeRate * pNo * (1 - pNo);
          }
        }
      }
    }
  }

  const perMarket = Array.from(byId.values()).map(({ m, s }) => {
    const pYes = clamp(m.pYes, 0, 1);
    const pNo = 1 - pYes;
    const mtm = s.cash + s.invYes * pYes + s.invNo * pNo;
    return {
      conditionId: m.conditionId,
      question: m.question,
      pYes,
      volumeUsd: m.volumeUsd,
      feeRate: m.feeRate,
      invYes: s.invYes,
      invNo: s.invNo,
      fillsYes: s.fillsYes,
      fillsNo: s.fillsNo,
      spreadPnl: s.spreadPnl,
      mtmPnl: mtm,
      feeEquivalent: s.feeEquivalent,
    };
  });

  perMarket.sort((a, b) => (b.mtmPnl - a.mtmPnl) || (b.feeEquivalent - a.feeEquivalent));

  const totals = perMarket.reduce(
    (acc, r) => {
      acc.mtmPnl += r.mtmPnl;
      acc.spreadPnl += r.spreadPnl;
      acc.feeEquivalent += r.feeEquivalent;
      acc.fills += r.fillsYes + r.fillsNo;
      return acc;
    },
    { mtmPnl: 0, spreadPnl: 0, feeEquivalent: 0, fills: 0 }
  );

  // Portfolio-level (paper) balance: cash + MTM value of inventories.
  // (Start cash is just a reference point.)
  const paperBalanceUsd = account.cashUsd + totals.mtmPnl;

  const result = {
    kind: "polymarket_paper_mm",
    seed,
    steps,
    refreshSeconds: opts.params.refreshSeconds,
    simMinutes: opts.params.simMinutes,
    params: opts.params,
    account: { startCashUsd: account.startCashUsd, cashUsd: account.cashUsd, paperBalanceUsd },
    totals,
    all: perMarket,
    top: perMarket.slice(0, 15),
  };

  await scratchpadAppend(sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: result,
  } as any);

  return { sp, result };
}

async function runGridOnce(root: string) {
  const sp = await scratchpadInit(root, { kind: "polymarket_paper_mm_grid" });

  const candidates = await scoutPolymarketRebates({ sp, limit: 200, minVolumeUsd: 50_000, topN: 12 });
  const markets: PaperMMMarket[] = candidates.map((c) => ({
    conditionId: c.conditionId,
    question: c.question,
    pYes: c.pYes,
    volumeUsd: c.volumeUsd,
    feeRate: c.feeRate,
  }));

  const spreads = [0.0025, 0.005, 0.01];
  const refreshes = [10, 15, 30];

  const rows: Array<any> = [];
  for (const quoteHalfSpread of spreads) {
    for (const refreshSeconds of refreshes) {
      const params: PaperMMParams = {
        quoteHalfSpread,
        refreshSeconds,
        maxInventorySharesPerSide: 200,
        tradeSizeShares: 20,
        simMinutes: 60,
        seed: 1337,
      };
      const { result } = await runPaperPolymarketMM({ root, sp, markets, params });
      rows.push({ quoteHalfSpread, refreshSeconds, ...result.totals });
    }
  }

  rows.sort((a, b) => b.mtmPnl - a.mtmPnl);

  await scratchpadAppend(sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: { kind: "polymarket_paper_mm_grid", markets: markets.length, rows },
  } as any);

  console.log("paper mm grid (sorted by mtmPnl):");
  for (const r of rows) {
    console.log(
      `hs=${r.quoteHalfSpread.toFixed(4)} refresh=${String(r.refreshSeconds).padStart(2)}s ` +
        `mtm=${r.mtmPnl.toFixed(2)} spread=${r.spreadPnl.toFixed(2)} feeEq=${r.feeEquivalent.toFixed(2)} fills=${r.fills}`
    );
  }

  console.log(`\nScratchpad: ${sp.path}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ROOT = path.resolve(process.cwd());
  runGridOnce(ROOT).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
