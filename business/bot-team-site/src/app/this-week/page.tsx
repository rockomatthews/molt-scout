import styles from "../page.module.css";

type Item = {
  title: string;
  why: string;
  output: string;
  status: "queued" | "building" | "blocked" | "done";
};

const items: Item[] = [
  {
    title: "NEXT UP #1: TheBotTeam Projects Gallery + per-project pages",
    why: "The site needs an obvious ‘what we do’ surface. A projects gallery makes everything legible, improves conversion, and gives us canonical links for socials.",
    output:
      "Add /projects page + data model + per-project page template + 8–12 initial projects + CTA (‘Request access’ / ‘Join waitlist’).",
    status: "building",
  },
  {
    title: "NEXT UP #2: Agent-swarm working end-to-end (XMTP → results → pay-on-success)",
    why: "This turns research into execution. Once tasks can be posted, claimed, delivered, and paid in USDC, the system can scale without humans.",
    output:
      "Task publisher + result ingester + idempotency + (optional) settlement module with strict caps.",
    status: "queued",
  },
  {
    title: "NEXT UP #3: HTTP 402 pay-per-action endpoint (USDC)",
    why: "Turns any API into a cash register. Low friction monetization for premium outputs.",
    output: "One 402-protected endpoint + onchain receipt verification + deliverable payload.",
    status: "queued",
  },
  {
    title: "Cyber Randy Chat: star trust + tag-to-speak",
    why: "Founder-controlled trust layer + public transparency. Bot only responds when tagged and user is starred.",
    output: "Vercel-ready chat room + admin star/unstar + bot reply wiring.",
    status: "building",
  },
  {
    title: "Agent Launch Radar (ALR): wallet login + USDC subscription",
    why: "Still the flagship funnel — but explicitly paused per founder while we upgrade the operating system.",
    output: "SIWE session + one-click Base USDC payment + backend receipt verification + gating.",
    status: "blocked",
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
