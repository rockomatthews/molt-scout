import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/app/lib/markdown";

function reportsDir() {
  // Synced at build time by scripts/sync_trade_school_scoreboard.mjs
  return path.resolve(process.cwd(), "public", "trade-school", "reports");
}

export default async function TradeSchoolReportPage(props: { params: Promise<{ date: string }> }) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const p = path.join(reportsDir(), `${date}.md`);
  let content: string;
  try {
    content = await fs.readFile(p, "utf8");
  } catch {
    notFound();
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{date}</h1>
        <Link href="/trade-school" style={{ opacity: 0.85 }}>
          ← Back
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <Markdown content={content} />
      </div>
    </main>
  );
}
