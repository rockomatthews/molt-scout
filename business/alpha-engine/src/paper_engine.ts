import { getPulseTokenTransactions } from "./pulse.js";
import { markPriceUsd, markQuote, pnlUsd, shouldExit } from "./paper.js";
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
    const opened = new Date((pos as any).openedAtIso).getTime();
    const ageMin = (now.getTime() - opened) / 60000;

    const px = await markPriceUsd(addr);

    // If pricing is missing, don't let positions get stuck forever.
    // Only force a time-based exit at entry price (0 pnl) once holdMinutes has elapsed.
    if (!px) {
      if (ageMin < opts.paper.holdMinutes) continue;

      const forcedPx = Number((pos as any).avgEntry);
      paper.cashUsd += (pos as any).qty * forcedPx;
      // realized PnL unchanged (0)
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
          px: forcedPx,
          pnlUsd: 0,
          reason: `time_${opts.paper.holdMinutes}m_no_price`,
        },
      } as any);
      continue;
    }

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
    skipped_price_sanity: 0,
    skipped_liquidity: 0,
    skipped_major: 0,
    entries: 0,
  };

  const MAJOR_DENY = new Set([
    // Base canonical WETH
    "0x4200000000000000000000000000000000000006",
    // Base USDC
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  ]);

  const pickPurchasedTokenAddress = (tx: any) => {
    const a = (tx.tokenAddress ? String(tx.tokenAddress) : "").toLowerCase();
    const b = (tx.otherTokenAddress ? String(tx.otherTokenAddress) : "").toLowerCase();
    // If one side is a known major and the other isn't, prefer the non-major.
    if (a && b) {
      const aMajor = MAJOR_DENY.has(a);
      const bMajor = MAJOR_DENY.has(b);
      if (aMajor && !bMajor) return b;
      if (bMajor && !aMajor) return a;
    }
    // Otherwise default to tokenAddress.
    return a || b || "";
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
    const addr = pickPurchasedTokenAddress(tx);
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

    // Skip majors (paper engine is for edge discovery, not DCA into majors)
    if (MAJOR_DENY.has(addr.toLowerCase())) {
      diag.skipped_major++;
      continue;
    }

    const q = await markQuote(addr);
    const px = q?.priceUsd;

    if (!px) {
      diag.skipped_no_price++;
      continue;
    }

    // Price sanity (avoid obviously broken pricing that leads to nonsense qty)
    if (!Number.isFinite(px) || px <= 0 || px < 1e-8 || px > 1_000_000) {
      diag.skipped_price_sanity++;
      continue;
    }

    // Liquidity sanity
    if ((q?.liquidityUsd || 0) < (opts.paper.minLiquidityUsd ?? 10_000)) {
      diag.skipped_liquidity++;
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
