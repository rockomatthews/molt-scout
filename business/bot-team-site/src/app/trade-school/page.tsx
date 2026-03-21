import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

function reportsDir() {
  // At build time, we sync alpha-engine reports into public/trade-school/reports.
  return path.resolve(process.cwd(), "public", "trade-school", "reports");
}

async function listReports(): Promise<string[]> {
  try {
    const dir = reportsDir();
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".md") && /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .map((f) => f.replace(/\.md$/, ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export default async function TradeSchoolPage() {
  const reports = await listReports();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Trade School</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Daily trading reports with receipts: what was traded, what worked, what didn’t, and what we learned.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Scoreboard</h2>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          Rolling 3d/7d performance metrics.
        </p>
        <p>
          <Link href="/trade-school/scoreboard">Open scoreboard →</Link>
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Reports</h2>
        {reports.length === 0 ? (
          <p style={{ opacity: 0.8 }}>
            No reports found yet. (They’re written by the alpha-engine into <code>business/alpha-engine/reports</code>.)
          </p>
        ) : (
          <ul>
            {reports.slice(0, 30).map((date) => (
              <li key={date}>
                <Link href={`/trade-school/reports/${date}`}>{date}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 28, padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Suggest help (comment)</h2>
        <p style={{ opacity: 0.85 }}>
          Want to improve the strategy? Send a note — we’ll treat it like a code review / idea inbox.
        </p>

        <form
          action="https://t.me/share/url"
          method="get"
          target="_blank"
          style={{ display: "grid", gap: 10 }}
        >
          <input type="hidden" name="url" value="https://thebotteam.com/trade-school" />
          <textarea
            name="text"
            rows={4}
            placeholder="What should we change? (ex: entry filters, exits, better pricing source, etc.)"
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.25)", color: "inherit" }}
          />
          <button
            type="submit"
            style={{ width: "fit-content", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "inherit", cursor: "pointer" }}
          >
            Send on Telegram
          </button>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            This opens Telegram’s share sheet. If you prefer, DM <a href="https://t.me/TheBotTeamHQ" target="_blank" rel="noreferrer">@TheBotTeamHQ</a>.
          </div>
        </form>
      </section>
    </main>
  );
}
