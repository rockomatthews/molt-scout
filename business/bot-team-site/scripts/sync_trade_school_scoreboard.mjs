import fs from "node:fs/promises";
import path from "node:path";

// Copies alpha-engine SCOREBOARD.md into bot-team-site public/ so Vercel can serve it.
// Run this locally (or in CI) before deploying the bot-team-site.

const here = path.resolve(process.cwd());
const srcScoreboardMd = path.resolve(here, "..", "alpha-engine", "reports", "SCOREBOARD.md");
const srcScoreboardJson = path.resolve(here, "..", "alpha-engine", "reports", "SCOREBOARD.json");
const srcReportsDir = path.resolve(here, "..", "alpha-engine", "reports");

const outBase = path.resolve(here, "public", "trade-school");
const outScoreboardMd = path.join(outBase, "scoreboard.md");
const outScoreboardJson = path.join(outBase, "scoreboard.json");
const outReportsDir = path.join(outBase, "reports");

await fs.mkdir(outBase, { recursive: true });
await fs.mkdir(outReportsDir, { recursive: true });

// Scoreboard (md + json)
const scoreboardMd = await fs.readFile(srcScoreboardMd, "utf8");
await fs.writeFile(outScoreboardMd, scoreboardMd, "utf8");

try {
  const scoreboardJson = await fs.readFile(srcScoreboardJson, "utf8");
  await fs.writeFile(outScoreboardJson, scoreboardJson, "utf8");
} catch {
  // json not present yet
}

console.log("wrote", outScoreboardMd);

// Daily reports
const files = await fs.readdir(srcReportsDir);
const reportFiles = files.filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
for (const f of reportFiles) {
  const md = await fs.readFile(path.join(srcReportsDir, f), "utf8");
  await fs.writeFile(path.join(outReportsDir, f), md, "utf8");
}
console.log("synced reports", reportFiles.length);
