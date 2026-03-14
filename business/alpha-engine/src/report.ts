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

async function findScratchpadPath(root: string, runId: string) {
  const spDir = path.join(root, ".scratchpad");
  try {
    const files = await fs.readdir(spDir);
    const hit = files.find((f) => f.includes(runId) && f.endsWith(".jsonl"));
    return hit ? path.join(spDir, hit) : null;
  } catch {
    return null;
  }
}

export async function writeDailyReport(root: string, state: any, runId: string) {
  const day = (state.day || new Date().toISOString().slice(0, 10)) as string;
  const dir = path.join(root, "reports");
  await fs.mkdir(dir, { recursive: true });

  const paper = state.paper || { cashUsd: null, positions: {} };
  const positions = Object.values(paper.positions || {}) as any[];

  // Parse scratchpad to reconstruct entries/exits + diagnostics.
  const spPath = await findScratchpadPath(root, runId);
  const entries: Record<string, PaperEntry> = {};
  const exits: Record<string, PaperExit> = {};
  let diag: any = null;

  if (spPath) {
    const raw = await fs.readFile(spPath, "utf8");
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
        diag = data.diag;
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
  if (spPath) lines.push(`Scratchpad: ${path.relative(root, spPath)}`);
  lines.push("");

  // 1) P&L + risk
  lines.push("## 1) P&L + risk");
  const cashNum = typeof paper.cashUsd === "number" ? paper.cashUsd : null;
  const cashStr = cashNum === null ? "—" : cashNum.toFixed(2);
  const realized = Number(state.realizedPnlUsd || 0);
  const startCash = Number(state.paperStartCashUsd || 1000);
  const pct = startCash ? (realized / startCash) * 100 : 0;
  lines.push(`- Start cash (paper): **$${startCash.toFixed(2)}**`);
  lines.push(`- End cash (paper): **$${cashStr}**`);
  lines.push(`- Realized PnL: **$${realized.toFixed(2)}** (${pct.toFixed(2)}%)`);
  lines.push(`- Exposure used: **$${Number(state.totalExposureUsd || 0).toFixed(2)}**`);
  lines.push(`- Open positions: **${positions.length}**`);
  lines.push("");

  // 2) Trades list (proof)
  lines.push("## 2) Trades list (proof)");
  if (!tradeIds.length) {
    lines.push("- (no paper trades this run)");
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
  lines.push("- Change today: added paper-trading skip diagnostics + relaxed Pulse filter (amountMinUsd 1000 → 500) + fixed pricing import resolution.");
  lines.push("- Evidence: see `paper_diag` in scratchpad; it reports why entries were skipped (no price, caps, etc.).");
  lines.push("- Next hypothesis: if `skipped_no_price` dominates, we need a fallback pricing path or better token address normalization.");
  if (diag) {
    lines.push("");
    lines.push("### Diagnostics (paper_diag)");
    lines.push("```json");
    lines.push(JSON.stringify(diag, null, 2));
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
