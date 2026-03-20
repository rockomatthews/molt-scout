import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function scratchpadIsoFromFilename(filename: string): string | null {
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
  const files = await fs.readdir(spDir).catch(() => [] as string[]);
  return files
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => ({ f, iso: scratchpadIsoFromFilename(f) }))
    .filter((x) => x.iso && mtDayFromIso(x.iso) === day)
    .sort((a, b) => String(a.iso).localeCompare(String(b.iso)))
    .map((x) => path.join(spDir, x.f));
}

type PaperExit = { tradeId: string; pnlUsd: number; ts: string; };

type DayStats = {
  day: string;
  realizedPnlUsd: number;
  tradesClosed: number;
  wins: number;
  losses: number;
  avgWinUsd: number;
  avgLossUsd: number;
  biggestWinUsd: number;
  biggestLossUsd: number;
};

export function configFingerprint(cfg: any): string {
  const stable = JSON.stringify(cfg);
  return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 12);
}

export async function computeDayStats(root: string, day: string): Promise<DayStats> {
  const spPaths = await listScratchpadsForDay(root, day);
  const exits: PaperExit[] = [];

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
      if (data?.kind === "paper_exit") {
        exits.push({ tradeId: data.tradeId, pnlUsd: Number(data.pnlUsd), ts: obj.ts });
      }
    }
  }

  const realized = exits.reduce((a, x) => a + (Number.isFinite(x.pnlUsd) ? x.pnlUsd : 0), 0);
  const wins = exits.filter((x) => x.pnlUsd > 0);
  const losses = exits.filter((x) => x.pnlUsd < 0);
  const avgWin = wins.length ? wins.reduce((a, x) => a + x.pnlUsd, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, x) => a + x.pnlUsd, 0) / losses.length : 0;
  const biggestWin = wins.length ? wins.map((x) => x.pnlUsd).sort((a, b) => b - a)[0] : 0;
  const biggestLoss = losses.length ? losses.map((x) => x.pnlUsd).sort((a, b) => a - b)[0] : 0;

  return {
    day,
    realizedPnlUsd: realized,
    tradesClosed: exits.length,
    wins: wins.length,
    losses: losses.length,
    avgWinUsd: avgWin,
    avgLossUsd: avgLoss,
    biggestWinUsd: biggestWin,
    biggestLossUsd: biggestLoss,
  };
}

export async function writeScoreboard(root: string, cfg: any, days: string[]): Promise<string> {
  const stats: DayStats[] = [];
  for (const d of days) stats.push(await computeDayStats(root, d));

  const last3 = stats.slice(-3);
  const last7 = stats.slice(-7);

  const sum = (xs: DayStats[]) => xs.reduce((a, s) => a + s.realizedPnlUsd, 0);
  const trades = (xs: DayStats[]) => xs.reduce((a, s) => a + s.tradesClosed, 0);
  const wins = (xs: DayStats[]) => xs.reduce((a, s) => a + s.wins, 0);

  const roll3 = { pnl: sum(last3), trades: trades(last3), winRate: trades(last3) ? (wins(last3) / trades(last3)) * 100 : 0 };
  const roll7 = { pnl: sum(last7), trades: trades(last7), winRate: trades(last7) ? (wins(last7) / trades(last7)) * 100 : 0 };

  const fp = configFingerprint(cfg);

  const lines: string[] = [];
  lines.push(`# Alpha Engine — Scoreboard`);
  lines.push("");
  lines.push(`Config fingerprint: ${fp}`);
  lines.push("");
  lines.push(`Rolling 3d: PnL $${roll3.pnl.toFixed(2)} · Trades ${roll3.trades} · WinRate ${roll3.winRate.toFixed(1)}%`);
  lines.push(`Rolling 7d: PnL $${roll7.pnl.toFixed(2)} · Trades ${roll7.trades} · WinRate ${roll7.winRate.toFixed(1)}%`);
  lines.push("");
  lines.push("## Daily");
  for (const s of stats.slice().reverse().slice(0, 14)) {
    lines.push(`- ${s.day}: PnL $${s.realizedPnlUsd.toFixed(2)} · closed ${s.tradesClosed} · win ${s.wins}/${s.tradesClosed || 0} · avgWin $${s.avgWinUsd.toFixed(2)} · avgLoss $${s.avgLossUsd.toFixed(2)} · best $${s.biggestWinUsd.toFixed(2)} · worst $${s.biggestLossUsd.toFixed(2)}`);
  }

  const outDir = path.join(root, "reports");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `SCOREBOARD.md`);
  await fs.writeFile(outPath, lines.join("\n"), "utf8");
  return outPath;
}
