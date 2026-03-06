import fs from "node:fs";
import path from "node:path";
import styles from "../../page.module.css";
import { Markdown } from "../../lib/markdown";

export const dynamic = "force-static";

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "content", "daily");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((f) => ({ date: f.replace(/\.md$/, "") }));
}

export default async function DailyPostPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const file = path.join(process.cwd(), "content", "daily", `${date}.md`);
  const content = fs.readFileSync(file, "utf8");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>{date}</h1>
            <p className={styles.p}>Daily Self-Improvement Log</p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Browse</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/daily">All daily posts</a>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: 14 }}>
          <Markdown content={content} />
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/daily">
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}
