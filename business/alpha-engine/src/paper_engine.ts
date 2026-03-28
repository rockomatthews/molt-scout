import { getPulseTokenTransactions } from "./pulse.js";
import { markPriceUsd, markQuote, pnlUsd, shouldExit } from "./paper.js";
import { scratchpadAppend } from "./scratchpad.js";
import { calcRsi, calcSma, fetchBestPoolForTokenBase, fetchPoolOhlcvBase } from "./candles.js";
import { quoteConfidenceBase } from "./quote_confidence.js";

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
    skipped_activity: 0,
    skipped_confidence: 0,
    skipped_confirmation2: 0,
    skipped_macro_riskoff: 0,
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

  // Macro gate (BTC/ETH regime). If macro is risk-off, do not open new positions.
  // We still allow exits above.
  const macro = opts.state?.macroRegime;
  const btc = macro?.symbols?.find((s: any) => String(s.symbol || "").toUpperCase() === "BTCUSDT");
  const riskOff =
    btc &&
    ((typeof btc.rsi === "number" && btc.rsi < 45) ||
      (typeof btc.current_price === "number" && typeof btc.sma_20 === "number" && btc.current_price < btc.sma_20) ||
      (typeof btc.sma_20 === "number" && typeof btc.sma_50 === "number" && btc.sma_20 < btc.sma_50));

  // Entry candidates (Base) via wallet.xyz Pulse
  const txs = await getPulseTokenTransactions({
    limit: 25,
    offset: 0,
    amountMinUsd: opts.paper.pulseAmountMinUsd ?? 500,
    marketCapMaxUsd: opts.paper.pulseMarketCapMaxUsd ?? 50_000_000,
    onlyWithProfile: opts.paper.pulseOnlyWithProfile ?? true,
  });
  diag.pulse_txs = txs.length;

  // Risk-off handling:
  // Default behavior was to block all new entries when macro is risk-off.
  // To avoid long stretches of zero trades, we allow a *strict* micro-mode
  // that only takes the cleanest setups under tighter filters.
  const riskOffMode = Boolean(riskOff);
  if (riskOffMode) {
    diag.skipped_macro_riskoff = txs.length; // informational: macro was risk-off this run
  }

  await scratchpadAppend(opts.sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "pulse", txs: txs.length },
  } as any);

  // Replay harness input: persist the raw Pulse txs used for candidate generation.
  await scratchpadAppend(opts.sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "pulse_txs", txs },
  } as any);

  // Phase 1: gather + quality-filter candidates
  const candidates: Array<{
    addr: string;
    tokenSymbol?: string;
    q: any;
    px: number;
    score: number;
  }> = [];

  const quotesUsed: Record<string, any> = {};
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

    // Skip majors (paper engine is for edge discovery, not DCA into majors)
    if (MAJOR_DENY.has(addr.toLowerCase())) {
      diag.skipped_major++;
      continue;
    }

    const q = await markQuote(addr);
    if (q) quotesUsed[addr.toLowerCase()] = q;
    const px = q?.priceUsd;

    // Quote confidence gate: skip weak/inconsistent marks.
    const qc = await quoteConfidenceBase(addr);
    // Persist qc into scratchpad quotesUsed too (helps replay/debug)
    quotesUsed[addr.toLowerCase()] = { ...(quotesUsed[addr.toLowerCase()] || {}), quoteConfidence: qc };
    const minConfBase = opts.paper.minQuoteConfidence ?? 0.55;
    const minConf = riskOffMode ? Math.max(0.70, minConfBase) : minConfBase;
    if (qc.confidence < minConf) {
      diag.skipped_confidence++;
      continue;
    }
    if (!px) {
      diag.skipped_no_price++;
      continue;
    }

    // Price sanity
    const minPx = opts.paper.minPriceUsd ?? 1e-7;
    if (!Number.isFinite(px) || px <= 0 || px < minPx || px > 1_000_000) {
      diag.skipped_price_sanity++;
      continue;
    }

    // Liquidity sanity
    if ((q?.liquidityUsd || 0) < (opts.paper.minLiquidityUsd ?? 10_000)) {
      diag.skipped_liquidity++;
      continue;
    }

    // Activity sanity
    if ((q?.volume24hUsd || 0) < (opts.paper.minVolume24hUsd ?? 2_000) || (q?.txns24h?.total || 0) < (opts.paper.minTxns24h ?? 20)) {
      diag.skipped_activity++;
      continue;
    }

    // Second-signal confirmation (independent from Pulse):
    //  (A) Dexscreener market-structure: positive 24h momentum + buy-pressure
    //  (B) Token-level candles (GeckoTerminal/Base): RSI + SMA confirmation
    const pc24 = Number(q?.priceChange24hPct || 0);
    const maxMomBase = opts.paper.maxMomentum24hPct ?? 300;
    const maxMom = riskOffMode ? Math.min(120, maxMomBase) : maxMomBase;
    if (Number.isFinite(pc24) && pc24 > maxMom) {
      diag.skipped_confirmation2++;
      continue;
    }
    const buys24 = Number(q?.txns24h?.buys || 0);
    const sells24 = Number(q?.txns24h?.sells || 0);
    const liqUsd0 = Number(q?.liquidityUsd || 0);
    const volUsd0 = Number(q?.volume24hUsd || 0);
    const volToLiq = liqUsd0 > 0 ? volUsd0 / liqUsd0 : 999;
    const maxVolToLiqBase = opts.paper.maxVolToLiq24h ?? 8;
    const maxVolToLiq = riskOffMode ? Math.min(4, maxVolToLiqBase) : maxVolToLiqBase;
    if (volToLiq > maxVolToLiq) {
      diag.skipped_confirmation2++;
      continue;
    }
    const ratio = sells24 > 0 ? buys24 / sells24 : buys24 > 0 ? 99 : 0;
    const minRatioBase = opts.paper.minBuySellRatio24h ?? 1.05;
    const minRatio = riskOffMode ? Math.max(1.25, minRatioBase) : minRatioBase;
    if ((Number.isFinite(pc24) && pc24 < 1) || ratio < minRatio) {
      diag.skipped_confirmation2++;
      continue;
    }

    // Candle-based confirmation (15m candles): RSI>=55 and close >= SMA20
    // If candles are missing, allow a *strict* flow-only pass to avoid "dead engine" mode.
    const pool = await fetchBestPoolForTokenBase(addr);
    const candles = pool
      ? await fetchPoolOhlcvBase({ poolAddress: pool, timeframe: "minute", aggregate: 15, limit: 60 })
      : [];

    // Volatility / wick filters (only when we actually have candles)
    if (candles.length >= 40) {
      const lastN = candles.slice(-20);
      const eps = 1e-12;
      const wickiness =
        lastN.reduce((acc, c) => acc + (c.h - c.l) / (Math.abs(c.c - c.o) + eps), 0) /
        Math.max(1, lastN.length);
      const maxRangePct =
        Math.max(...lastN.map((c) => ((c.h - c.l) / Math.max(eps, c.c)) * 100));

      const wickinessMax = opts.paper.wickinessMax ?? 6;
      const maxRange15mPct = opts.paper.maxRange15mPct ?? 12;
      if (!Number.isFinite(wickiness) || wickiness > wickinessMax || !Number.isFinite(maxRangePct) || maxRangePct > maxRange15mPct) {
        diag.skipped_confirmation2++;
        continue;
      }
    }

    const closes = candles.map((c) => c.c);
    const rsi = calcRsi(closes, 14);
    const sma20 = calcSma(closes, 20);
    const last = closes[closes.length - 1];

    const hasTa = typeof rsi === "number" && typeof sma20 === "number" && Number.isFinite(last);
    const taPass = hasTa && (rsi as number) >= 55 && (last as number) >= (sma20 as number);

    if (!taPass) {
      // Graceful degradation: if we have no/insufficient candles, allow a high-quality flow pass.
      const noCandles = !pool || candles.length < 40 || !hasTa;
      if (!noCandles) {
        diag.skipped_confirmation2++;
        continue;
      }

      const conf = Number(qc.confidence || 0);
      const txnsTot = Number(q?.txns24h?.total || 0);
      const liqUsd = Number(q?.liquidityUsd || 0);
      const bsRatio = ratio;
      const pc = pc24;

      // Flow-pass (no candles): keep this strict enough to avoid junk,
      // but not so strict that the engine goes dead when candle APIs fail.
      const flowPass =
        conf >= 0.68 &&
        txnsTot >= 300 &&
        liqUsd >= 25_000 &&
        bsRatio >= 1.2 &&
        Number.isFinite(pc) &&
        pc >= 1 &&
        pc <= 1000;

      if (!flowPass) {
        diag.skipped_confirmation2++;
        continue;
      }
    }

    // Best-of-batch score (aggressive, but quality-biased)
    const score = (Number(q?.volume24hUsd || 0) * Math.max(1, Number(q?.txns24h?.total || 0))) + Number(q?.liquidityUsd || 0);

    candidates.push({ addr, tokenSymbol: tx.tokenSymbol || undefined, q, px, score });
  }

  // Replay harness input: persist the quotes observed during candidate filtering.
  await scratchpadAppend(opts.sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "paper_quotes", quotes: quotesUsed },
  } as any);

  // Phase 2: enter highest-quality candidates first
  candidates.sort((a, b) => b.score - a.score);

  const maxEntriesPerRunBase = opts.paper.maxEntriesPerRun ?? 2;
  const maxEntriesPerRun = riskOffMode ? Math.min(2, maxEntriesPerRunBase) : maxEntriesPerRunBase;
  for (const c of candidates) {
    if (diag.entries >= maxEntriesPerRun) break;
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

    // might have been entered earlier in this run
    if (paper.positions[c.addr]) continue;

    const qty = opts.risk.usdPerTrade / c.px;
    paper.cashUsd -= opts.risk.usdPerTrade;
    const tradeId = `${opts.sp.runId}:${c.addr.slice(0, 6)}:${Date.now()}`;
    paper.positions[c.addr] = {
      tradeId,
      tokenAddress: c.addr,
      symbol: c.tokenSymbol,
      qty,
      avgEntry: c.px,
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
        tokenAddress: c.addr,
        symbol: c.tokenSymbol,
        entryPx: c.px,
        usd: opts.risk.usdPerTrade,
        quote: {
          dexId: c.q?.dexId,
          liquidityUsd: c.q?.liquidityUsd,
          volume24hUsd: c.q?.volume24hUsd,
          txns24h: c.q?.txns24h,
          priceChange24hPct: c.q?.priceChange24hPct,
          pairUrl: c.q?.pairUrl,
        },
        score: c.score,
      },
    } as any);

    if (Object.keys(paper.positions).length >= opts.paper.maxPositions) break;
  }

  await scratchpadAppend(opts.sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: opts.sp.runId,
    data: { kind: "paper_diag", diag },
  } as any);
}
