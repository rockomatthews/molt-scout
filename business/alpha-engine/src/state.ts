import fs from "node:fs/promises";
import path from "node:path";

export type State = {
  version: 1;
  lastAlertByTicker: Record<string, string>; // ISO timestamp
  day: string; // YYYY-MM-DD (local-ish)
  realizedPnlUsd: number;
  totalExposureUsd: number;
};

export async function loadState(rootDir: string): Promise<State> {
  const p = path.join(rootDir, "state.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as State;
  } catch {
    return {
      version: 1,
      lastAlertByTicker: {},
      day: new Date().toISOString().slice(0, 10),
      realizedPnlUsd: 0,
      totalExposureUsd: 0,
    };
  }
}

export async function saveState(rootDir: string, s: State): Promise<void> {
  const p = path.join(rootDir, "state.json");
  await fs.writeFile(p, JSON.stringify(s, null, 2), "utf8");
}
