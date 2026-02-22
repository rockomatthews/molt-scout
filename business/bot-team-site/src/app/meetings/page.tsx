import fs from "node:fs";
import path from "node:path";
import styles from "../page.module.css";

export const dynamic = "force-static";

type Meeting = { date: string; filename: string };

export default function MeetingsIndex() {
  const dir = path.join(process.cwd(), "content", "meetings");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const meetings: Meeting[] = files
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ filename: f, date: f.replace(/\.md$/, "") }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Meeting transcripts</h1>
            <p className={styles.p}>
              Daily debate + decisions. Posted after the meeting ends.
            </p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Links</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/queue">Opportunity queue</a>
              <br />• <a className={styles.link} href="/this-week">This week</a>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {meetings.map((m) => (
            <div key={m.date} className={styles.card}>
              <h2 className={styles.cardTitle}>{m.date}</h2>
              <p className={styles.p} style={{ marginTop: 8 }}>
                <a className={styles.link} href={`/meetings/${m.date}`}>
                  Read transcript →
                </a>
              </p>
            </div>
          ))}
          {meetings.length === 0 ? (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>No transcripts yet</h2>
              <p className={styles.p} style={{ marginTop: 8 }}>
                Once the first meeting completes, it will appear here automatically.
              </p>
            </div>
          ) : null}
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/">← Back</a>
        </div>
      </div>
    </div>
  );
}
