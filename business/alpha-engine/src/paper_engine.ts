import { getPulseTokenTransactions } from "./pulse.js";
import { markPriceUsd, pnlUsd, shouldExit } from "./paper.js";
import { scratchpadAppend } from "./scratchpad.js";

export async function runPaperTrading(opts: {
  root: string;
  sp: { path: string; runId: string };
  state: any;
  risk: { usdPerTrade: number; maxTotalExposureUsd: number; maxDailyLossUsd: number };
  paper: { startCashUsd: number; holdMinutes: number; takeProfitPct: number; stopLossPct: number; maxPositions: number };
}) {
  const now = new Date();

  const paper = opts.state.paper || { cashUsd: opts.paper.startCashUsd, positions: {} };
  opts.state.paper = paper;

  // Exit logic first
  for (const [addr, pos] of Object.entries(paper.positions)) {
    const px = await markPriceUsd(addr);
    if (!px) continue;

    const exitCheck = shouldExit({
      pos: pos as any,
      px,
      now,
      holdMinutes: opts.paper.holdMinutes,
      takeProfitPct: opts.paper.takeProfitPct,
      stopLossPct: opts.paper.stopLossPct,
    });

    if (!exitCheck.exit) continue;

    const profit = pnlUsd(pos as any, px);
    paper.cashUsd += (pos as any).qty * px;
    opts.state.realizedPnlUsd += profit;
    opts.state.totalExposureUsd -= opts.risk.usdPerTrade;

    delete paper.positions[addr];

    await scratchpadAppend(opts.sp.path, {
      type: "result",
      ts: new Date().toISOString(),
      runId: opts.sp.runId,
      data: { kind: "paper_exit", tokenAddress: addr, px, pnlUsd: profit, reason: exitCheck.reason },
    } as any);
  }

  // Entry candidates (Base) via wallet.xyz Pulse
  const txs = await getPulseTokenTransactions({
    limit: 25,
    offset: 0,
    amountMinUsd: 1000,
    marketCapMaxUsd: 50_000_000,
    onlyWithProfile: true,
  });

  await scratchpadAppend(opts.sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "pulse", txs: txs.length },
  } as any);

  for (const tx of txs) {
    const addr = tx.tokenAddress;
    if (!addr) continue;
    if (String(tx.chain || "").toLowerCase() !== "base") continue;
    if (paper.positions[addr]) continue;

    if (opts.state.realizedPnlUsd <= -Math.abs(opts.risk.maxDailyLossUsd)) break;
    if (opts.state.totalExposureUsd + opts.risk.usdPerTrade > opts.risk.maxTotalExposureUsd) break;
    if (paper.cashUsd < opts.risk.usdPerTrade) break;

    const px = await markPriceUsd(addr);
    if (!px) continue;

    const qty = opts.risk.usdPerTrade / px;
    paper.cashUsd -= opts.risk.usdPerTrade;
    paper.positions[addr] = {
      tokenAddress: addr,
      symbol: tx.tokenSymbol || undefined,
      qty,
      avgEntry: px,
      openedAtIso: new Date().toISOString(),
    };

    opts.state.totalExposureUsd += opts.risk.usdPerTrade;

    await scratchpadAppend(opts.sp.path, {
      type: "action",
      ts: new Date().toISOString(),
      runId: opts.sp.runId,
      data: { kind: "paper_entry", tokenAddress: addr, symbol: tx.tokenSymbol, entryPx: px, usd: opts.risk.usdPerTrade },
    } as any);

    // cap entries per run
    if (Object.keys(paper.positions).length >= 10) break;
  }
}
