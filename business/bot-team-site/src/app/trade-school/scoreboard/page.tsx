import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ScoreboardClient from "./ScoreboardClient";

async function loadScoreboardMd(): Promise<string> {
  try {
    const p = path.resolve(process.cwd(), "public", "trade-school", "scoreboard.md");
    return await fs.readFile(p, "utf8");
  } catch {
    return "# Scoreboard\n\nScoreboard not found. Run `npm run prebuild` (or `npm run build`) to sync it.";
  }
}

export default async function TradeSchoolScoreboardPage() {
  const md = await loadScoreboardMd();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Trade School — Scoreboard</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Rolling performance metrics (derived from paper trading scratchpads).
      </p>

      <section style={{ marginTop: 18 }}>
        <ScoreboardClient />
      </section>

      <section style={{ marginTop: 18, padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Raw (markdown)</div>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </section>

      <div style={{ opacity: 0.7, fontSize: 13, marginTop: 12 }}>
        Source: <code>alpha-engine/reports/SCOREBOARD.*</code> → <code>bot-team-site/public/trade-school/scoreboard.*</code>
      </div>
    </main>
  );
}
