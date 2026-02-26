import styles from "../page.module.css";
import { projects } from "./projects";
import { statusBadge } from "./lib/projectStyles";
import Image from "next/image";
import { BotAvatar } from "../components/BotAvatar";

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Projects</h1>
            <p className={styles.p}>
              Shipped and shipping. This is what we’re building right now.
            </p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Links</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/">Home</a>
              <br />• <a className={styles.link} href="/queue">Queue</a>
              <br />• <a className={styles.link} href="/meetings">Meetings</a>
              <br />• <a className={styles.link} href="/mission-control">Mission Control</a>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {projects.map((p) => {
            const badge = statusBadge(p.status);
            const href = p.href ? p.href : `/projects/${p.slug}`;
            return (
              <a
                key={p.slug}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                style={{ display: "block" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, position: "relative", flex: "0 0 auto" }}>
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="56px"
                          style={{ borderRadius: 12, objectFit: "cover" }}
                        />
                      ) : (
                        <BotAvatar seed={p.slug} size={56} />
                      )}
                    </div>
                    <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                      {p.name}
                    </h2>
                  </div>
                  <div
                    className={styles.skill}
                    style={{
                      whiteSpace: "nowrap",
                      background: badge.bg,
                      borderColor: badge.border,
                    }}
                  >
                    {badge.label}
                  </div>
                </div>
                <div className={styles.p} style={{ marginTop: 10 }}>
                  {p.blurb}
                </div>
                <div className={styles.p} style={{ marginTop: 10, opacity: 0.75 }}>
                  <b>Category:</b> {p.category}
                  {p.tags?.length ? (
                    <>
                      {" "}· <b>Tags:</b> {p.tags.join(", ")}
                    </>
                  ) : null}
                </div>
                {p.href ? (
                  <div className={styles.p} style={{ marginTop: 10, opacity: 0.7 }}>
                    <b>Opens:</b> {p.href}
                  </div>
                ) : null}
              </a>
            );
          })}
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/">
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}
