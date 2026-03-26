import fs from "node:fs/promises";
import path from "node:path";
import { loadReplaySnapshot, simulateEntries } from "./replay.js";

function arg(name: string) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function loadJson(p: string) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

const ROOT = path.resolve(process.cwd());
const day = arg("--day") || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const configAPath = arg("--config");
const configBPath = arg("--config2");
if (!configAPath || !configBPath) {
  console.error("Usage: npm run replay:ab -- --day YYYY-MM-DD --config <configA.json> --config2 <configB.json>");
  process.exit(1);
}

const cfgA = await loadJson(path.resolve(ROOT, configAPath));
const cfgB = await loadJson(path.resolve(ROOT, configBPath));

const snap = await loadReplaySnapshot(ROOT, day);

function paperFromCfg(cfg: any) {
  const p = cfg.paper || {};
  return {
    maxPositions: Number(p.maxPositions ?? 10),
    maxEntriesPerRun: Number(p.maxEntriesPerRun ?? 2),
    minLiquidityUsd: Number(p.minLiquidityUsd ?? 10_000),
    minVolume24hUsd: Number(p.minVolume24hUsd ?? 2_000),
    minTxns24h: Number(p.minTxns24h ?? 20),
    minPriceUsd: Number(p.minPriceUsd ?? 1e-7),
    minBuySellRatio24h: Number(p.minBuySellRatio24h ?? 1.05),
    minMomentum24hPct: Number(p.minMomentum24hPct ?? 1),
    maxMomentum24hPct: Number(p.maxMomentum24hPct ?? 300),
    minQuoteConfidence: Number(p.minQuoteConfidence ?? 0),
    maxVolToLiq24h: Number(p.maxVolToLiq24h ?? 8),
    scoreMode: (p.scoreMode === "factors" ? "factors" : "legacy") as any,
    scoreWeights: p.scoreWeights || undefined,
  };
}

const simA = simulateEntries({ pulseTxs: snap.pulseTxs, quotes: snap.quotes, paper: paperFromCfg(cfgA) });
const simB = simulateEntries({ pulseTxs: snap.pulseTxs, quotes: snap.quotes, paper: paperFromCfg(cfgB) });

const setA = new Set(simA.selected.map((x) => x.addr));
const setB = new Set(simB.selected.map((x) => x.addr));

const onlyA = simA.selected.filter((x) => !setB.has(x.addr));
const onlyB = simB.selected.filter((x) => !setA.has(x.addr));

console.log(
  JSON.stringify(
    {
      day,
      snapshot: { runIds: snap.runIds, pulseTxs: snap.pulseTxs.length, quotes: Object.keys(snap.quotes).length },
      a: { config: configAPath, selected: simA.selected.map((x) => x.addr), diag: simA.diag },
      b: { config: configBPath, selected: simB.selected.map((x) => x.addr), diag: simB.diag },
      diff: {
        onlyA: onlyA.map((x) => ({ addr: x.addr, score: x.score })),
        onlyB: onlyB.map((x) => ({ addr: x.addr, score: x.score })),
      },
    },
    null,
    2
  )
);
