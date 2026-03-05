import fs from "node:fs";
import path from "node:path";
import styles from "../page.module.css";
import { Markdown } from "../lib/markdown";

export const dynamic = "force-static";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function QueuePage() {
  const file = path.join(process.cwd(), "content", "QUEUE.md");
  const content = fs.readFileSync(file, "utf8");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Queue</h1>
            <p className={styles.p}>
              Deprecated. We’re focused on shipping client ops systems and closing retainers.
            </p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Links</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/services">Services</a>
              <br />• <a className={styles.link} href="/pricing">Pricing</a>
              <br />• <a className={styles.link} href="/proof">Proof</a>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: 14 }}>
          <Markdown content={content} />
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/">← Back</a>
        </div>
      </div>
    </div>
  );
}
