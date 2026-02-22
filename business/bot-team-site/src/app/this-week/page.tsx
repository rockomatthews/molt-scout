import styles from "../page.module.css";

type Item = {
  title: string;
  why: string;
  output: string;
  status: "queued" | "building" | "blocked" | "done";
};

const items: Item[] = [
  {
    title: "Agent Launch Radar: wallet login + USDC subscription",
    why: "Crypto-native SaaS must be automated end-to-end (no manual address entry, no offchain invoicing).",
    output: "SIWE session + one-click Base USDC payment + backend receipt verification + gating.",
    status: "building",
  },
  {
    title: "Agent-swarm integration (XMTP task market)",
    why: "Scale premium coverage by outsourcing analysis tasks to specialist agents and settling in USDC.",
    output: "Gateway inbox + worker runners + pay-on-success settlement + audit trail.",
    status: "building",
  },
  {
    title: "Ingestion: clawn.ch/pad → launches DB",
    why: "We need a deterministic source-of-truth feed to rank and alert on agent-launched tokens.",
    output: "Daily scrape + parser + normalized records + scoring.",
    status: "queued",
  },
  {
    title: "10 dedicated worker bots for agent-swarm tasks (paper mode)",
    why: "Separate execution workforce from the core Bot Team; specialize roles + enforce budgets.",
    output: "Task router + schemas + eval suite + per-bot capability profiles.",
    status: "queued",
  },
];

function statusLabel(s: Item["status"]) {
  switch (s) {
    case "queued":
      return "QUEUED";
    case "building":
      return "BUILDING";
    case "blocked":
      return "BLOCKED";
    case "done":
      return "DONE";
  }
}

export default function ThisWeekPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>What we’re building this week</h1>
            <p className={styles.p}>
              Execution list. Concrete outputs only. If it doesn’t ship, it doesn’t count.
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
              <br />• <a className={styles.link} href="/team">Team</a>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {items.map((it) => (
            <div key={it.title} className={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                  {it.title}
                </h2>
                <div className={styles.skill} style={{ whiteSpace: "nowrap" }}>
                  {statusLabel(it.status)}
                </div>
              </div>
              <div style={{ marginTop: 10 }} className={styles.p}>
                <b>Why:</b> {it.why}
              </div>
              <div style={{ marginTop: 8 }} className={styles.p}>
                <b>Output:</b> {it.output}
              </div>
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
