import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import { Markdown } from "../../lib/markdown";

export const dynamic = "force-static";

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "content", "meetings");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ date: f.replace(/\.md$/, "") }));
}

export default async function MeetingPage({
  params,
}: {
  params: { date?: string } | Promise<{ date?: string }>;
}) {
  const resolved = await Promise.resolve(params);
  const date = resolved?.date;
  if (!date) return notFound();

  const file = path.join(process.cwd(), "content", "meetings", `${date}.md`);
  if (!fs.existsSync(file)) return notFound();
  const content = fs.readFileSync(file, "utf8");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Meeting: {date}</h1>
            <p className={styles.p}>Transcript + debate + decisions.</p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Links</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/meetings">All transcripts</a>
              <br />• <a className={styles.link} href="/queue">Opportunity queue</a>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: 14 }}>
          <Markdown content={content} />
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/meetings">← Back</a>
        </div>
      </div>
    </div>
  );
}
