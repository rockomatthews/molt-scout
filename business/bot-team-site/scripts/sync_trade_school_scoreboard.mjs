import fs from "node:fs/promises";
import path from "node:path";

// Copies alpha-engine SCOREBOARD.md into bot-team-site public/ so Vercel can serve it.
// Run this locally (or in CI) before deploying the bot-team-site.

const here = path.resolve(process.cwd());
const src = path.resolve(here, "..", "alpha-engine", "reports", "SCOREBOARD.md");
const outDir = path.resolve(here, "public", "trade-school");
const dst = path.join(outDir, "scoreboard.md");

await fs.mkdir(outDir, { recursive: true });
const md = await fs.readFile(src, "utf8");
await fs.writeFile(dst, md, "utf8");
console.log("wrote", dst);
