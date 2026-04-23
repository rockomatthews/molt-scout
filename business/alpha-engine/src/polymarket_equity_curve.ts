import fs from "node:fs/promises";
import path from "node:path";

export type EquityPoint = {
  ts: string;
  paperBalanceUsd: number;
  mtmPnlUsd: number;
  fills: number;
};

export async function appendEquityPoint(root: string, pt: EquityPoint) {
  const p = path.join(root, "logs", "polymarket_equity_curve.jsonl");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, JSON.stringify(pt) + "\n", "utf8");
  return p;
}

export async function readEquityCurve(root: string, limit = 200): Promise<EquityPoint[]> {
  const p = path.join(root, "logs", "polymarket_equity_curve.jsonl");
  try {
    const raw = await fs.readFile(p, "utf8");
    const lines = raw.trim().split(/\n+/).filter(Boolean);
    const tail = lines.slice(Math.max(0, lines.length - limit));
    return tail.map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}
