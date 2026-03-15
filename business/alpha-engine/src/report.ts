import fs from "node:fs/promises";
import path from "node:path";

type PaperEntry = {
  tradeId: string;
  tokenAddress: string;
  symbol?: string;
  entryPx: number;
  usd: number;
  ts: string;
};

type PaperExit = {
  tradeId: string;
  tokenAddress: string;
  px: number;
  pnlUsd: number;
  reason?: string;
  ts: string;
};

async function listScratchpadsForDay(root: string, day: string) {
  const spDir = path.join(root, ".scratchpad");
  try {
    const files = await fs.readdir(spDir);
    // scratchpads are named like: YYYY-MM-DDTHH-mm-ss-..._runid.jsonl
    const hits = files
      .filter((f) => f.startsWith(day + "T") && f.endsWith(".jsonl"))
      .map((f) => path.join(spDir, f))
      .sort();
    return hits;
  } catch {
    return [] as string[];
  }
}

export async function writeDailyReport(root: string, state: any, runId: string) {
  const day = (state.day || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())) as string;
  const dir = path.join(root, "reports");
  await fs.mkdir(dir, { recursive: true });

  const paper = state.paper || { cashUsd: null, positions: {} };
  const positionsNow = Object.values(paper.positions || {}) as any[];

  // Parse ALL scratchpads for the day to reconstruct a true "daily" trades list.
  const spPaths = await listScratchpadsForDay(root, day);
  const entries: Record<string, PaperEntry> = {};
  const exits: Record<string, PaperExit> = {};
  const diags: Array<{ runId: string; ts: string; diag: any }> = [];

  for (const spPath of spPaths) {
    const raw = await fs.readFile(spPath, "utf8").catch(() => "");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      let obj: any;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      const data = obj?.data;
      if (data?.kind === "paper_entry") {
        entries[data.tradeId] = {
          tradeId: data.tradeId,
          tokenAddress: data.tokenAddress,
          symbol: data.symbol || undefined,
          entryPx: Number(data.entryPx),
          usd: Number(data.usd),
          ts: obj.ts,
        };
      }
      if (data?.kind === "paper_exit") {
        exits[data.tradeId] = {
          tradeId: data.tradeId,
          tokenAddress: data.tokenAddress,
          px: Number(data.px),
          pnlUsd: Number(data.pnlUsd),
          reason: data.reason,
          ts: obj.ts,
        };
      }
      if (data?.kind === "paper_diag") {
        diags.push({ runId: obj.runId, ts: obj.ts, diag: data.diag });
      }
    }
  }

  const tradeIds = Array.from(new Set([...Object.keys(entries), ...Object.keys(exits)])).sort();

  // Basic stats
  const realizedTrades = tradeIds.filter((id) => exits[id]);
  const wins = realizedTrades.filter((id) => (exits[id]?.pnlUsd || 0) > 0);
  const losses = realizedTrades.filter((id) => (exits[id]?.pnlUsd || 0) < 0);
  const avgWin = wins.length ? wins.reduce((a, id) => a + (exits[id]?.pnlUsd || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, id) => a + (exits[id]?.pnlUsd || 0), 0) / losses.length : 0;

  const biggestWinner = wins
    .map((id) => ({ id, pnl: exits[id]?.pnlUsd || 0 }))
    .sort((a, b) => b.pnl - a.pnl)[0];
  const biggestLoser = losses
    .map((id) => ({ id, pnl: exits[id]?.pnlUsd || 0 }))
    .sort((a, b) => a.pnl - b.pnl)[0];

  const lines: string[] = [];
  lines.push(`# Alpha Engine — Daily Report (${day})`);
  lines.push("");
  lines.push(`RunId: ${runId}`);
  if (spPaths.length) {
    lines.push(`Scratchpads (${spPaths.length}):`);
    for (const p of spPaths.slice(-10)) {
      lines.push(`- ${path.relative(root, p)}`);
    }
    if (spPaths.length > 10) lines.push(`- … (+${spPaths.length - 10} more)`);
  }
  lines.push("");

  // 1) P&L + risk
  lines.push("## 1) P&L + risk");

  const startCash = Number(state.paperStartCashUsd || 1000);
  const realized = realizedTrades.reduce((a, id) => a + (exits[id]?.pnlUsd || 0), 0);
  const openTradeIds = tradeIds.filter((id) => !exits[id]);
  const openExposure = openTradeIds.reduce((a, id) => a + (entries[id]?.usd || 0), 0);
  const endCashComputed = startCash - openExposure + realized;
  const pct = startCash ? (realized / startCash) * 100 : 0;

  lines.push(`- Start cash (paper): **$${startCash.toFixed(2)}**`);
  lines.push(`- End cash (paper, computed): **$${endCashComputed.toFixed(2)}**`);
  lines.push(`- Realized PnL: **$${realized.toFixed(2)}** (${pct.toFixed(2)}%)`);
  lines.push(`- Open exposure: **$${openExposure.toFixed(2)}** / $${Number(state.risk?.maxTotalExposureUsd || 120).toFixed(2)} cap`);
  lines.push(`- Open positions (today ledger): **${openTradeIds.length}**`);

  const cashNowNum = typeof paper.cashUsd === "number" ? paper.cashUsd : null;
  if (cashNowNum !== null) {
    lines.push(`- State now: cash **$${cashNowNum.toFixed(2)}**, positions **${positionsNow.length}**, exposureCounter **$${Number(state.totalExposureUsd || 0).toFixed(2)}**`);
  }
  lines.push("");

  // 2) Trades list (proof)
  lines.push("## 2) Trades list (proof)");
  if (!tradeIds.length) {
    lines.push("- (no paper trades today)");
  } else {
    for (const id of tradeIds) {
      const e = entries[id];
      const x = exits[id];
      const sym = e?.symbol || "(unknown)";
      const addr = e?.tokenAddress || x?.tokenAddress || "(unknown)";
      const entryLine = e ? `entry ${new Date(e.ts).toISOString()} @ $${e.entryPx.toFixed(6)}` : "entry —";
      const exitLine = x
        ? `exit ${new Date(x.ts).toISOString()} @ $${x.px.toFixed(6)} · PnL $${x.pnlUsd.toFixed(2)} · ${x.reason || "—"}`
        : "exit OPEN";
      lines.push(`- **${id}** · ${sym} · ${addr}`);
      lines.push(`  - ${entryLine}`);
      lines.push(`  - ${exitLine}`);
    }
  }
  lines.push("");

  // 3) What worked vs didn’t (measured)
  lines.push("## 3) What worked vs didn’t (measured)");
  const winRate = realizedTrades.length ? (wins.length / realizedTrades.length) * 100 : 0;
  lines.push(`- Trades closed: **${realizedTrades.length}** · Win rate: **${winRate.toFixed(1)}%**`);
  lines.push(`- Avg win: **$${avgWin.toFixed(2)}** · Avg loss: **$${avgLoss.toFixed(2)}**`);
  lines.push(`- Biggest winner: **${biggestWinner ? `${biggestWinner.id} ($${biggestWinner.pnl.toFixed(2)})` : "—"}**`);
  lines.push(`- Biggest loser: **${biggestLoser ? `${biggestLoser.id} ($${biggestLoser.pnl.toFixed(2)})` : "—"}**`);
  lines.push("");

  // 4) Learning log
  lines.push("## 4) Learning log");
  lines.push("- Change today: fixed Pulse chain id parsing + token address selection; added paper-trading skip diagnostics; added price sanity + major-token denylist + min liquidity filter; fixed tsx runner flag for Node >=20.6.");
  lines.push("- Evidence: see `paper_diag` in scratchpads; it reports why entries were skipped (no price, caps, etc.).");
  lines.push("- Next hypothesis: if `skipped_major` dominates, we need better filtering to target non-major tokens; if `skipped_liquidity` dominates, tune minLiquidityUsd; if `skipped_no_price` dominates, add pricing fallbacks.");
  if (diags.length) {
    diags.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
    const latest = diags[diags.length - 1];
    lines.push("");
    lines.push("### Diagnostics (latest paper_diag)");
    lines.push(`RunId: ${latest.runId}`);
    lines.push("```json");
    lines.push(JSON.stringify(latest.diag, null, 2));
    lines.push("```");
  }
  lines.push("");

  // 5) Next 24h plan
  lines.push("## 5) Next 24h plan");
  lines.push("1) Add pricing fallback for common Base tokens + better Dexscreener pair selection (expected: fewer skipped_no_price). Guardrail: keep $/trade + exposure caps unchanged.");
  lines.push("2) Enforce maxPositions consistently (expected: prevent over-entry). Guardrail: maxPositions from config.");
  lines.push("3) If still zero entries, log first 5 candidate token addresses + chains for manual inspection.");
  lines.push("");

  const outPath = path.join(dir, `${day}.md`);
  await fs.writeFile(outPath, lines.join("\n"), "utf8");
  return outPath;
}
