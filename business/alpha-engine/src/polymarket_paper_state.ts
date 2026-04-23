import fs from "node:fs/promises";
import path from "node:path";

export type PaperMarketPos = {
  conditionId: string;
  invYes: number;
  invNo: number;
};

export type PaperPortfolioState = {
  kind: "polymarket_paper_state";
  ts: string;
  startCashUsd: number;
  cashUsd: number;
  positions: Record<string, PaperMarketPos>;
};

export async function loadPaperState(root: string, startCashUsd = 20_000): Promise<PaperPortfolioState> {
  const p = path.join(root, "logs", "polymarket_paper_state.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    const j = JSON.parse(raw);
    if (j && j.kind === "polymarket_paper_state" && typeof j.cashUsd === "number") return j;
  } catch {}

  return {
    kind: "polymarket_paper_state",
    ts: new Date().toISOString(),
    startCashUsd,
    cashUsd: startCashUsd,
    positions: {},
  };
}

export async function savePaperState(root: string, st: PaperPortfolioState) {
  const p = path.join(root, "logs", "polymarket_paper_state.json");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify({ ...st, ts: new Date().toISOString() }, null, 2) + "\n", "utf8");
  return p;
}

export function getOrInitPos(st: PaperPortfolioState, conditionId: string): PaperMarketPos {
  const k = conditionId;
  if (!st.positions[k]) st.positions[k] = { conditionId, invYes: 0, invNo: 0 };
  return st.positions[k];
}
