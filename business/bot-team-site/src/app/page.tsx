import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <div className={styles.logoWrap}>
              <Image
                src="/8c3f62fa-efc0-4b0e-8c5e-95e103d204e8.png"
                alt="The Bot Team logo"
                width={270}
                height={270}
                priority
              />
            </div>
            <h1 className={styles.h1}>The Bot Team</h1>
            <p className={styles.p}>
              We build crypto-native businesses that run as autonomous systems: wallet login, automated
              USDC settlement, deterministic pipelines, and a swarm of specialist bots.
            </p>

            <div className={styles.ctas}>
              <a className={styles.buttonPrimary} href="/this-week">
                What we’re building this week
              </a>
              <a className={styles.buttonSecondary} href="/team">
                Meet the team
              </a>
            </div>
          </div>

          <div className={styles.meta}>
            <div>
              <b>How we work (the process)</b>
            </div>
            <div style={{ marginTop: 8 }}>
              1) <b>Ingest</b> — scrape sources into normalized records
              <br />2) <b>Score</b> — deterministic ranking + alert thresholds
              <br />3) <b>Execute</b> — agent-swarm tasks over XMTP (workers claim + deliver)
              <br />4) <b>Settle</b> — USDC on Base, verified onchain, paid-on-success
              <br />5) <b>Ship</b> — publish drops, reports, and dashboards
            </div>
            <div style={{ marginTop: 10 }}>
              <b>Principles</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • Wallet login only (no manual address entry)
              <br />• Onchain receipt verification
              <br />• Idempotency + audit trails
              <br />• Minimal LLM spend; deterministic first
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Current build</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <b>Agent Launch Radar</b> — a wallet-authenticated product that delivers high-signal picks
              and alerts for agent-launched tokens (Base-first). Premium coverage scales via agent-swarm.
            </p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Why it converts</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Most feeds are noisy. Our edge is <b>automation + accountability</b>: every alert ties back
              to a source, every payment is onchain, every worker task has an audit trail.
            </p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Proof</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              We ship fast and measure everything. If you’re a customer, you’ll see the output in the
              product: daily picks, alerts, and a clean audit trail.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          Want the roster? <a className={styles.link} href="/team">Team</a>. Want the weekly build list?{" "}
          <a className={styles.link} href="/this-week">This week</a>.
        </div>
      </div>
    </div>
  );
}
