import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";

import { loadConfig } from "./config.js";
import { loadState, saveState } from "./state.js";
import { log } from "./logger.js";
import { fetchTrendingCasts } from "./neynar.js";
import { extractTickers, scorePost } from "./scoring.js";
import { proposeTrade, executeTrade } from "./bankr.js";
import { scratchpadAppend, scratchpadInit } from "./scratchpad.js";
import { runPaperTrading } from "./paper_engine.js";

const ROOT = path.resolve(process.cwd());

function minutesSince(iso: string): number {
  const then = new Date(iso).getTime();
  return (Date.now() - then) / 60000;
}

async function appendLog(obj: unknown) {
  const p = path.join(ROOT, "logs", "events.jsonl");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + "\n", "utf8");
}

async function runOnce() {
  const cfg = await loadConfig(ROOT);
  const state = await loadState(ROOT);

  const sp = await scratchpadInit(ROOT, {
    app: "alpha-engine",
    dryRun: cfg.mode.dryRun,
    liveTrading: cfg.mode.liveTrading,
    paperTrading: cfg.mode.paperTrading,
    risk: cfg.risk,
    alerts: cfg.alerts,
    paper: cfg.paper,
    state: {
      day: state.day,
      realizedPnlUsd: state.realizedPnlUsd,
      totalExposureUsd: state.totalExposureUsd,
      goodAlertsCount: state.goodAlertsCount,
      paper: {
        cashUsd: state.paper?.cashUsd,
        positions: Object.keys(state.paper?.positions || {}).length,
      },
    },
  });

  // Reset day counters if day changed
  const today = new Date().toISOString().slice(0, 10);
  if (state.day !== today) {
    state.day = today;
    state.realizedPnlUsd = 0;
    state.goodAlertsCount = 0;
    state.askedToGoLive = false;
  }

  if (cfg.mode.liveTrading && cfg.mode.dryRun) {
    log.warn("config inconsistency: liveTrading=true but dryRun=true; treating as dry run");
  }

  if (state.realizedPnlUsd <= -Math.abs(cfg.risk.maxDailyLossUsd)) {
    log.error({ realizedPnlUsd: state.realizedPnlUsd }, "Daily loss limit hit; refusing to trade");
    await saveState(ROOT, state);
    return;
  }

  log.info({ dryRun: cfg.mode.dryRun, liveTrading: cfg.mode.liveTrading, risk: cfg.risk }, "alpha-engine run");
  await scratchpadAppend(sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: { mode: cfg.mode, risk: cfg.risk },
  });

  // Fetch input
  let casts;
  try {
    casts = await fetchTrendingCasts(10);
  } catch (err) {
    log.warn({ err }, "neynar fetch failed; nothing to do");
    const msg = String((err as any)?.message || err);
    await appendLog({ kind: "error", where: "neynar", message: msg });
    await scratchpadAppend(sp.path, {
      type: "error",
      ts: new Date().toISOString(),
      runId: sp.runId,
      where: "neynar",
      message: msg,
    });
    return;
  }

  log.info({ casts: casts.length }, "neynar casts fetched");
  await scratchpadAppend(sp.path, {
    type: "input",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: { castsFetched: casts.length },
  });

  // Score + candidate selection
  const candidates: Array<{ score: number; tickers: string[]; text: string; url: string }> = [];
  for (const c of casts) {
    const score = scorePost(c.text || "");
    if (score < cfg.alerts.minScoreToAlert) continue;
    const tickers = extractTickers(c.text || "");
    if (!tickers.length) continue;
    const url = `https://warpcast.com/${c.author?.username}/${c.hash}`;
    candidates.push({ score, tickers, text: c.text || "", url });
  }

  candidates.sort((a, b) => b.score - a.score);
  log.info({ candidates: candidates.length }, "candidates after scoring");
  await scratchpadAppend(sp.path, {
    type: "signal",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: {
      candidates: candidates.slice(0, 10).map((c) => ({
        score: c.score,
        tickers: c.tickers,
        url: c.url,
      })),
    },
  });

  // Paper trading (Base onchain tokens) — deterministic + risk-capped
  if (cfg.mode.paperTrading && cfg.paper.enabled) {
    try {
      await runPaperTrading({ root: ROOT, sp, state, risk: cfg.risk, paper: cfg.paper });
      await scratchpadAppend(sp.path, {
        type: "result",
        ts: new Date().toISOString(),
        runId: sp.runId,
        data: {
          kind: "paper_summary",
          cashUsd: state.paper?.cashUsd,
          positions: Object.keys(state.paper?.positions || {}).length,
          realizedPnlUsd: state.realizedPnlUsd,
          exposureUsd: state.totalExposureUsd,
        },
      } as any);
    } catch (err: any) {
      const msg = String(err?.message || err);
      log.warn({ err }, "paperTrading failed");
      await scratchpadAppend(sp.path, {
        type: "error",
        ts: new Date().toISOString(),
        runId: sp.runId,
        where: "paperTrading",
        message: msg,
      } as any);
    }
  }

  for (const cand of candidates.slice(0, 5)) {
    for (const ticker of cand.tickers.slice(0, 2)) {
      const last = state.lastAlertByTicker[ticker];
      if (last && minutesSince(last) < cfg.alerts.cooldownMinutesPerTicker) continue;

      state.lastAlertByTicker[ticker] = new Date().toISOString();

      // Always log the alert event
      await appendLog({ kind: "alert", ticker, score: cand.score, url: cand.url, text: cand.text.slice(0, 280) });
      await scratchpadAppend(sp.path, {
        type: "signal",
        ts: new Date().toISOString(),
        runId: sp.runId,
        data: { kind: "alert", ticker, score: cand.score, url: cand.url, text: cand.text.slice(0, 280) },
      });

      // Count "good" alerts during dry-run (simple heuristic: strong score)
      if ((cfg.mode.dryRun || !cfg.mode.liveTrading) && cand.score >= 75) {
        state.goodAlertsCount = (state.goodAlertsCount || 0) + 1;
        await appendLog({ kind: "good_alert", ticker, score: cand.score, url: cand.url });
      }

      // Trading path (disabled until creds + liveTrading)
      const dryRun = cfg.mode.dryRun || !cfg.mode.liveTrading;
      const trade = await proposeTrade({ ticker, text: cand.text, usdPerTrade: cfg.risk.usdPerTrade });

      if (!trade) {
        log.info({ ticker, score: cand.score, url: cand.url }, "ALERT (no trade intent)\n" + cand.text);
        await scratchpadAppend(sp.path, {
          type: "action",
          ts: new Date().toISOString(),
          runId: sp.runId,
          data: { action: "alert_only", ticker, score: cand.score, url: cand.url },
        });
        continue;
      }

      if (dryRun) {
        log.warn({ trade }, "DRY_RUN trade intent (not executed)");
        await scratchpadAppend(sp.path, {
          type: "action",
          ts: new Date().toISOString(),
          runId: sp.runId,
          data: { action: "dry_run_trade_intent", trade },
        });
        continue;
      }

      if (state.totalExposureUsd + trade.usdSize > cfg.risk.maxTotalExposureUsd) {
        log.warn({ trade, exposure: state.totalExposureUsd }, "Exposure cap would be exceeded; skipping trade");
        continue;
      }

      const res = await executeTrade(trade);
      await appendLog({ kind: "trade", trade, result: res });
      await scratchpadAppend(sp.path, {
        type: "result",
        ts: new Date().toISOString(),
        runId: sp.runId,
        data: { action: "execute_trade", trade, result: res },
      });
      if (res.ok) state.totalExposureUsd += trade.usdSize;

      log.info({ trade, res }, "trade attempt");
    }
  }

  await saveState(ROOT, state);
}

await runOnce();
