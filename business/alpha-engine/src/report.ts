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

function scratchpadIsoFromFilename(filename: string): string | null {
  // Example: 2026-03-17T01-34-16-483Z_<runid>.jsonl
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z_/);
  if (!m) return null;
  const [, d, hh, mm, ss, ms] = m;
  return `${d}T${hh}:${mm}:${ss}.${ms}Z`;
}

function mtDayFromIso(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

async function listScratchpadsForDay(root: string, day: string) {
  const spDir = path.join(root, ".scratchpad");
  try {
    const files = await fs.readdir(spDir);

    // scratchpads are timestamped in UTC (Z) in the filename; map them to MT day.
    const hits = files
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => {
        const iso = scratchpadIsoFromFilename(f);
        return { f, iso };
      })
      .filter((x) => x.iso && mtDayFromIso(x.iso) === day)
      .map((x) => path.join(spDir, x.f))
      .sort();

    return hits;
  } catch {
    return [] as string[];
  }
}

async function listAllScratchpads(root: string) {
  const spDir = path.join(root, ".scratchpad");
  try {
    const files = await fs.readdir(spDir);
    return files
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({ f, iso: scratchpadIsoFromFilename(f) }))
      .filter((x) => x.iso)
      // newest first
      .sort((a, b) => String(b.iso).localeCompare(String(a.iso)))
      .map((x) => path.join(spDir, x.f));
  } catch {
    return [] as string[];
  }
}

export async function writeDailyReport(root: string, state: any, runId: string) {
  // Day boundary is America/Denver; always compute fresh for report generation.
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) as string;
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

  // Backfill missing entries for exits by scanning recent scratchpads (carry positions across days).
  const missingEntryIds = tradeIds.filter((id) => exits[id] && !entries[id]);
  if (missingEntryIds.length) {
    const allScratchpads = await listAllScratchpads(root);
    const want = new Set(missingEntryIds);

    // Scan up to ~250 scratchpads to avoid unbounded work.
    for (const spPath of allScratchpads.slice(0, 250)) {
      if (!want.size) break;
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
        if (data?.kind === "paper_entry" && want.has(data.tradeId)) {
          entries[data.tradeId] = {
            tradeId: data.tradeId,
            tokenAddress: data.tokenAddress,
            symbol: data.symbol || undefined,
            entryPx: Number(data.entryPx),
            usd: Number(data.usd),
            ts: obj.ts,
          };
          want.delete(data.tradeId);
          if (!want.size) break;
        }
      }
    }
  }

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

  const startCash = Number((state.paperStartCashUsd ?? 1000));
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

  // Sanity note if state.day differs from computed report day (can happen if engine hasn't run today).
  if (state.day && state.day !== day) {
    lines.push(`- Note: state.day is **${String(state.day)}** but report day is **${day}** (MT). Run alpha-engine to roll day counters.`);
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
      const fmtPx = (n: number) => {
        if (!Number.isFinite(n) || n <= 0) return "0";
        if (n < 1e-6) return n.toExponential(2);
        if (n < 1) return n.toFixed(8);
        return n.toFixed(6);
      };

      const entryLine = e ? `entry ${new Date(e.ts).toISOString()} @ $${fmtPx(e.entryPx)}` : "entry —";
      const exitLine = x
        ? `exit ${new Date(x.ts).toISOString()} @ $${fmtPx(x.px)} · PnL $${x.pnlUsd.toFixed(2)} · ${x.reason || "—"}`
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
