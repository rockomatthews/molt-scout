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
      data: {
        kind: "paper_exit",
        tradeId: (pos as any).tradeId,
        tokenAddress: addr,
        px,
        pnlUsd: profit,
        reason: exitCheck.reason,
      },
    } as any);
  }

  const diag: Record<string, number> = {
    pulse_txs: 0,
    skipped_no_addr: 0,
    skipped_not_base: 0,
    skipped_already_held: 0,
    skipped_daily_loss_cap: 0,
    skipped_exposure_cap: 0,
    skipped_cash_cap: 0,
    skipped_no_price: 0,
    entries: 0,
  };

  // Entry candidates (Base) via wallet.xyz Pulse
  // Relaxed amountMinUsd slightly so paper trading actually gets enough candidates.
  const txs = await getPulseTokenTransactions({
    limit: 25,
    offset: 0,
    amountMinUsd: 500,
    marketCapMaxUsd: 50_000_000,
    onlyWithProfile: true,
  });
  diag.pulse_txs = txs.length;

  await scratchpadAppend(opts.sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "pulse", txs: txs.length },
  } as any);

  for (const tx of txs) {
    const addr = tx.tokenAddress;
    if (!addr) {
      diag.skipped_no_addr++;
      continue;
    }
    {
      const chain = String(tx.chain || "").toLowerCase();
      const isBase = chain === "base" || chain === "8453";
      if (!isBase) {
        diag.skipped_not_base++;
        continue;
      }
    }
    if (paper.positions[addr]) {
      diag.skipped_already_held++;
      continue;
    }

    if (opts.state.realizedPnlUsd <= -Math.abs(opts.risk.maxDailyLossUsd)) {
      diag.skipped_daily_loss_cap++;
      break;
    }
    if (opts.state.totalExposureUsd + opts.risk.usdPerTrade > opts.risk.maxTotalExposureUsd) {
      diag.skipped_exposure_cap++;
      break;
    }
    if (paper.cashUsd < opts.risk.usdPerTrade) {
      diag.skipped_cash_cap++;
      break;
    }

    const px = await markPriceUsd(addr);
    if (!px) {
      diag.skipped_no_price++;
      continue;
    }

    const qty = opts.risk.usdPerTrade / px;
    paper.cashUsd -= opts.risk.usdPerTrade;
    const tradeId = `${opts.sp.runId}:${addr.slice(0, 6)}:${Date.now()}`;
    paper.positions[addr] = {
      tradeId,
      tokenAddress: addr,
      symbol: tx.tokenSymbol || undefined,
      qty,
      avgEntry: px,
      openedAtIso: new Date().toISOString(),
    };

    opts.state.totalExposureUsd += opts.risk.usdPerTrade;

    diag.entries++;

    await scratchpadAppend(opts.sp.path, {
      type: "action",
      ts: new Date().toISOString(),
      runId: opts.sp.runId,
      data: {
        kind: "paper_entry",
        tradeId,
        tokenAddress: addr,
        symbol: tx.tokenSymbol,
        entryPx: px,
        usd: opts.risk.usdPerTrade,
      },
    } as any);

    // cap entries per run / total positions
    if (Object.keys(paper.positions).length >= opts.paper.maxPositions) break;
  }

  await scratchpadAppend(opts.sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "paper_diag", diag },
  } as any);
}
