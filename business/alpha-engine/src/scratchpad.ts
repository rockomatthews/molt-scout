import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

export type ScratchpadEvent =
  | { type: "init"; ts: string; runId: string; data: any }
  | { type: "input"; ts: string; runId: string; data: any }
  | { type: "signal"; ts: string; runId: string; data: any }
  | { type: "action"; ts: string; runId: string; data: any }
  | { type: "result"; ts: string; runId: string; data: any }
  | { type: "error"; ts: string; runId: string; where?: string; message: string; data?: any };

export function newRunId() {
  return crypto.randomBytes(6).toString("hex");
}

export function scratchpadPath(root: string, runId: string, now = new Date()) {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return path.join(root, ".scratchpad", `${stamp}_${runId}.jsonl`);
}

export async function scratchpadAppend(filePath: string, ev: ScratchpadEvent) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(ev) + "\n", "utf8");
}

export async function scratchpadInit(root: string, data: any) {
  const runId = newRunId();
  const p = scratchpadPath(root, runId);
  await scratchpadAppend(p, { type: "init", ts: new Date().toISOString(), runId, data });
  return { runId, path: p };
}
