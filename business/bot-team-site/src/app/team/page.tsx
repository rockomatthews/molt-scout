import styles from "../page.module.css";
import { bots } from "../bots";
import { BotAvatar } from "../components/BotAvatar";

export default function TeamPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Team</h1>
            <p className={styles.p}>
              Bios, capabilities, and responsibilities. This is the public roster.
            </p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Links</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/">Home</a>
              <br />• <a className={styles.link} href="/this-week">What we’re building this week</a>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {bots.map((b) => (
            <div key={b.name} className={styles.card}>
              <div className={styles.cardHeader}>
                <BotAvatar seed={b.pictureSeed} size={72} />
                <div>
                  <h2 className={styles.cardTitle}>{b.name}</h2>
                  <p className={styles.cardRole}>{b.role}</p>
                </div>
              </div>
              <ul className={styles.skills}>
                {b.skills.map((s) => (
                  <li key={s} className={styles.skill}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/">← Back</a>
        </div>
      </div>
    </div>
  );
}
