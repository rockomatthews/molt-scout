/*
  Minimal X pulse via Monid (Apify tweet-scraper) for a list of queries.
  Keeps limits tiny to preserve credits.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

async function monidJson(args: string[]) {
  const { stdout } = await execFileP("monid", args, {
    env: { ...process.env, NO_COLOR: "1" },
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(stdout.toString());
}

export async function fetchXPulse(opts: {
  queries: string[];
  maxItems?: number;
  sinceHours?: number;
}) {
  const maxItems = opts.maxItems ?? 8;
  const sinceHours = opts.sinceHours ?? 24;

  const results: any[] = [];
  for (const q of opts.queries) {
    // Apify tweet-scraper supports advanced search; we keep it simple.
    // Using a time filter if supported via query string (since:YYYY-MM-DD) is possible,
    // but to avoid guessing schema we use basic query and small maxItems.
    const input = {
      searchTerms: [q],
      maxItems,
    };

    const run = await monidJson([
      "run",
      "-p",
      "apify",
      "-e",
      "/apidojo/tweet-scraper",
      "-i",
      JSON.stringify(input),
      "-w",
      "60",
      "-j",
    ]);

    results.push({ query: q, run });
  }

  return {
    ts: new Date().toISOString(),
    kind: "monid_x_pulse",
    sinceHours,
    maxItems,
    results,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const queries = process.argv.slice(2);
  fetchXPulse({ queries: queries.length ? queries : ["Polymarket"], maxItems: 5 }).then((r) => {
    console.log(JSON.stringify(r, null, 2));
  });
}
