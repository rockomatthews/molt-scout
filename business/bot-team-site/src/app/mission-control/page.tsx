import styles from "../page.module.css";

const BEACON_URL = "https://claw-beaconfrontend-production.up.railway.app";

export default function MissionControlPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Mission Control</h1>
            <p className={styles.p}>
              Live Claw Beacon dashboard (Kanban + agent feed). If the embed is blocked by browser
              security, use the direct link.
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Direct: {" "}
              <a className={styles.link} href={BEACON_URL} target="_blank" rel="noreferrer">
                {BEACON_URL}
              </a>
            </p>
          </div>
          <div className={styles.meta}>
            <div>
              <b>Notes</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • Backlog sync comes from /queue
              <br />• Agents will appear once heartbeat bridge is live
            </div>
          </div>
        </div>

        <div
          className={styles.card}
          style={{ marginTop: 14, padding: 0, overflow: "hidden" }}
        >
          <iframe
            src={BEACON_URL}
            title="Claw Beacon"
            style={{ width: "100%", height: "78vh", border: 0 }}
            allow="clipboard-read; clipboard-write"
          />
        </div>

        <div className={styles.footer}>
          <a className={styles.link} href="/">← Back</a>
        </div>
      </div>
    </div>
  );
}
