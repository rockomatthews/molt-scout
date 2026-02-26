import styles from "../../page.module.css";
import { projects } from "../projects";
import { statusBadge } from "../lib/projectStyles";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <div>
              <h1 className={styles.h1}>Not found</h1>
              <p className={styles.p}>No project with slug: {slug}</p>
            </div>
          </div>
          <div className={styles.footer}>
            <a className={styles.link} href="/projects" target="_blank" rel="noopener noreferrer">
              ← Back to Projects
            </a>
          </div>
        </div>
      </div>
    );
  }

  const badge = statusBadge(p.status);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1} style={{ marginBottom: 10 }}>
              {p.name}
            </h1>
            <div className={styles.p}>{p.blurb}</div>
            <div className={styles.p} style={{ marginTop: 12, opacity: 0.85 }}>
              <b>Category:</b> {p.category}
              {p.tags?.length ? (
                <>
                  {" "}· <b>Tags:</b> {p.tags.join(", ")}
                </>
              ) : null}
            </div>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Status</b>
            </div>
            <div
              className={styles.skill}
              style={{
                marginTop: 8,
                display: "inline-block",
                background: badge.bg,
                borderColor: badge.border,
              }}
            >
              {badge.label}
            </div>

            {p.href ? (
              <div style={{ marginTop: 12 }}>
                <a className={styles.link} href={p.href} target="_blank" rel="noopener noreferrer">
                  Open link ↗
                </a>
              </div>
            ) : null}

            <div style={{ marginTop: 12 }}>
              <a className={styles.link} href="/projects" target="_blank" rel="noopener noreferrer">
                ← Back to Projects
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/" target="_blank" rel="noopener noreferrer">
            Home
          </a>
          {" "}·{" "}
          <a className={styles.link} href="/queue" target="_blank" rel="noopener noreferrer">
            Queue
          </a>
          {" "}·{" "}
          <a className={styles.link} href="/meetings" target="_blank" rel="noopener noreferrer">
            Meetings
          </a>
        </div>
      </div>
    </div>
  );
}
