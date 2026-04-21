/*
  Monid signal fetch (read-only): discover endpoints + run small pulls.

  NOTE: we keep this as a CLI-oriented script for now (runs on the host),
  and persist results into logs/monid_signals.json.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execFileP = promisify(execFile);

async function sh(args: string[]) {
  const { stdout } = await execFileP("monid", args, {
    env: { ...process.env, NO_COLOR: "1" },
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.toString();
}

export async function discoverSocialEndpoints() {
  // Keep it broad, we will refine after we see what providers/endpoints exist.
  const q = "X twitter posts reddit search sentiment";
  const raw = await sh(["discover", "-q", q, "-j"]);
  return JSON.parse(raw);
}

export async function runMonidSignalsOnce() {
  const root = path.resolve(process.cwd());

  const discovered = await discoverSocialEndpoints();

  const out = {
    ts: new Date().toISOString(),
    kind: "monid_discover",
    query: "X twitter posts reddit search sentiment",
    discovered,
  };

  const outPath = path.join(root, "logs", "monid_signals.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  return { outPath, out };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMonidSignalsOnce().then(({ outPath }) => console.log(outPath));
}
