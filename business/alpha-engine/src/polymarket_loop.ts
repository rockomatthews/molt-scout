/*
  Polymarket autonomous loop (paper-only)

  Runs:
  1) Rebate scout (read-only Gamma)
  2) Paper MM simulator on top markets
  3) Writes a compact snapshot to logs/polymarket_loop.json

  No signing, no keys.
*/

import fs from "node:fs/promises";
import path from "node:path";
import { scratchpadInit, scratchpadAppend } from "./scratchpad.js";
import { scoutPolymarketRebates } from "./polymarket_rebate_scout.js";
import { runPaperPolymarketMM } from "./polymarket_paper_mm.js";

const ROOT = path.resolve(process.cwd());

export async function runPolymarketLoop(opts?: { topN?: number; minVolumeUsd?: number }) {
  const sp = await scratchpadInit(ROOT, { app: "alpha-engine", kind: "polymarket_loop" });

  const top = await scoutPolymarketRebates({
    sp,
    limit: 200,
    minVolumeUsd: opts?.minVolumeUsd ?? 100_000,
    topN: opts?.topN ?? 10,
  });

  const { result } = await runPaperPolymarketMM({
    root: ROOT,
    sp,
    markets: top,
    params: {
      quoteHalfSpread: 0.005,
      refreshSeconds: 15,
      maxInventorySharesPerSide: 300,
      tradeSizeShares: 25,
      simMinutes: 60,
    },
  });
  const mm = result;

  const out = {
    ts: new Date().toISOString(),
    kind: "polymarket_loop",
    topMarkets: top,
    mm,
  };

  const outPath = path.join(ROOT, "logs", "polymarket_loop.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  await scratchpadAppend(sp.path, {
    type: "result",
    ts: new Date().toISOString(),
    runId: sp.runId,
    data: { kind: "polymarket_loop_written", path: outPath },
  } as any);

  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPolymarketLoop().then((r) => {
    console.log(outSummary(r));
  });
}

function outSummary(r: any) {
  const mtm = r?.mm?.mtmPnlUsd;
  const fills = r?.mm?.fills;
  return JSON.stringify({ ok: true, ts: r?.ts, markets: (r?.topMarkets || []).length, mtmPnlUsd: mtm, fills }, null, 2);
}
