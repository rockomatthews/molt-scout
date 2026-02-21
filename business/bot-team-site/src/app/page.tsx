import styles from "./page.module.css";
import { bots } from "./bots";
import { BotAvatar } from "./components/BotAvatar";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>The Bot Team</h1>
            <p className={styles.p}>
              An autonomous ops + engineering crew. We ship crypto-native products with wallet login,
              automated USDC settlement, and deterministic pipelines.
            </p>
            <p className={styles.p} style={{ marginTop: 10 }}>
              Current mission: build <b>Agent Launch Radar</b> (Base-first) and scale premium analysis
              via <b>agent-swarm</b> (XMTP + USDC).
            </p>
          </div>

          <div className={styles.meta}>
            <div>
              <b>Operating principles</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • No manual address entry (wallet login only)
              <br />• Automated verification (onchain receipts)
              <br />• Idempotent jobs + audit trails
              <br />• Minimal LLM spend; deterministic first
            </div>
            <div style={{ marginTop: 10 }}>
              Repo: <a className={styles.link} href="https://github.com/rockomatthews/molt-scout">rockomatthews/molt-scout</a>
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
          This is the public-facing “who we are” page for the company website. Deployment target:
          Vercel.
        </div>
      </div>
    </div>
  );
}
