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
              Headcount: <b>human + autonomous</b>. We operate like a digital agency that ships code.
              <br />
              X ops, community ops, deployments, monitoring, and Base-USDC payments — run as systems.
            </p>

            <div className={styles.ctas}>
              <a className={styles.buttonPrimary} href="/services">
                Services
              </a>
              <a className={styles.buttonSecondary} href="/pricing">
                Pricing
              </a>
              <a className={styles.buttonSecondary} href="/team">
                Team
              </a>
            </div>

            <div style={{ marginTop: 12, opacity: 0.85 }}>
              Contact: <a className={styles.link} href="mailto:cio@thebotteam.com">cio@thebotteam.com</a>
            </div>
          </div>

          <div className={styles.meta}>
            <div>
              <b>What we actually run</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • <b>X/Twitter</b> — posting + mention replies with caps
              <br />• <b>Telegram</b> — onboarding, moderation, support
              <br />• <b>Deploy</b> — ship sites/APIs + sane rollbacks
              <br />• <b>Payments</b> — crypto checkout in USDC (Base)
              <br />• <b>Intelligence</b> — alerts + paid artifacts with provenance
            </div>
            <div style={{ marginTop: 10 }}>
              <b>Principles</b>
            </div>
            <div style={{ marginTop: 8 }}>
              • No hype. Receipts &gt; claims.
              <br />• Deterministic first; LLMs where they help.
              <br />• Guardrails on anything that can cost money.
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Offer</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <b>$1,500/mo</b> Base-USDC retainer for autonomous ops — plus <b>$5 pay-per-artifact</b> downloads.
            </p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Proof</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              We link to live demos and source. No “capabilities deck.”
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <a className={styles.link} href="/proof">See proof →</a>
            </p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Get started</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Talk to the team like you’d talk to a co-founder. We’ll propose the system and ship it.
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <a className={styles.link} href="mailto:cio@thebotteam.com">
                Email cio@thebotteam.com →
              </a>
            </p>
          </div>
        </div>

        <div className={styles.grid} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Clients / case studies</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Early stage: we’re building in public. Here are the systems you can click right now.
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              • <a className={styles.link} href="/proof">Proof page</a> — live demos + repos
              <br />• <a className={styles.link} href="https://github.com/rockomatthews/x-autoposter" target="_blank" rel="noreferrer">X autoposter</a> — posting + reply caps
              <br />• <a className={styles.link} href="https://github.com/rockomatthews/x402-paywalled-mcp" target="_blank" rel="noreferrer">Crypto checkout</a> — pay with USDC on Base
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>How we work (weekly)</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              1) <b>Intake</b> — one call + access checklist
              <br />2) <b>Ship</b> — deploy the first system in 48–72h
              <br />3) <b>Run</b> — daily ops cycles + monitoring + logging
              <br />4) <b>Report</b> — weekly summary + next-week plan
              <br />5) <b>Improve</b> — automations ratchet upward; humans only where needed
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Goal: you stop context switching and the business keeps moving.
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>What we don’t do</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              • No hype marketing
              <br />• No “guaranteed ROI” claims
              <br />• No unsafe key handling (never paste keys into chat)
              <br />• No silent automation that can spend money without approval
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          Keep browsing: <a className={styles.link} href="/services">Services</a> ·{" "}
          <a className={styles.link} href="/pricing">Pricing</a> ·{" "}
          <a className={styles.link} href="/proof">Proof</a> ·{" "}
          <a className={styles.link} href="/team">Team</a>
        </div>
      </div>
    </div>
  );
}

