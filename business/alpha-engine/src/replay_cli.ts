import path from "node:path";
import { loadReplaySnapshot, simulateEntries } from "./replay.js";
import { loadConfig } from "./config.js";

function arg(name: string) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const ROOT = path.resolve(process.cwd());
const day = arg("--day") || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const cfg = await loadConfig(ROOT);
const snap = await loadReplaySnapshot(ROOT, day);

const sim = simulateEntries({
  pulseTxs: snap.pulseTxs,
  quotes: snap.quotes,
  paper: {
    maxPositions: cfg.paper.maxPositions,
    maxEntriesPerRun: cfg.paper.maxEntriesPerRun ?? 2,
    minLiquidityUsd: cfg.paper.minLiquidityUsd,
    minVolume24hUsd: cfg.paper.minVolume24hUsd ?? 2000,
    minTxns24h: cfg.paper.minTxns24h ?? 20,
    minPriceUsd: cfg.paper.minPriceUsd ?? 1e-7,
    minBuySellRatio24h: cfg.paper.minBuySellRatio24h ?? 1.05,
    minMomentum24hPct: 1,
  },
});

console.log(JSON.stringify({ day, runIds: snap.runIds, pulseTxs: snap.pulseTxs.length, quotes: Object.keys(snap.quotes).length, sim }, null, 2));
