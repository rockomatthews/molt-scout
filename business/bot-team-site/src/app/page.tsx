import Image from "next/image";
import styles from "./page.module.css";
import { UiHighlights } from "./components/UiHighlights";

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
              We build and maintain <b>small business websites</b> with Next.js + Material UI.
              <br />
              Clean design, fast load times, mobile-first, and easy updates.
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
              Reach us on Telegram: <a className={styles.link} href="https://t.me/coinbullmoney" target="_blank" rel="noreferrer">@coinbullmoney</a>
            </div>
          </div>

          <div className={styles.meta}>
            <div>
              <b>Numbers</b>
            </div>
            <div style={{ marginTop: 8 }}>
              2
              <br />
              sites shipped
              <br />
              <br />
              $1,000
              <br />
              landing page sprint
              <br />
              <br />
              $1,500/mo
              <br />
              retainer
            </div>
            <div style={{ marginTop: 10 }}>
              <b>What we do</b>
            </div>
            <div style={{ marginTop: 8 }}>
              Website design + build (Next.js)
              <br />Material UI polish
              <br />Email capture + basic analytics
              <br />Ongoing updates
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Offer</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Small business websites + ongoing updates.
              <br />
              <b>$1,500/mo</b> ops retainer, plus <b>$5 pay-per-download</b> artifacts.
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
              <a className={styles.link} href="https://t.me/coinbullmoney" target="_blank" rel="noreferrer">
                DM on Telegram →
              </a>
            </p>
          </div>
        </div>

        <div className={styles.grid} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Featured build: DJ Park City</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              A real small business site we built with <b>Next.js</b> + <b>Material UI</b>.
            </p>
            <a href="https://djparkcity.com" target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/case-studies/djparkcity.png"
                alt="DJ Park City website preview"
                style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)" }}
              />
            </a>
            <p className={styles.p} style={{ marginTop: 10 }}>
              <a className={styles.link} href="https://djparkcity.com" target="_blank" rel="noreferrer">
                Open djparkcity.com →
              </a>
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Built for small business owners</h2>
            <p className={styles.p} style={{ marginTop: 8 }}>
              Clean, fast, mobile-first websites — with a process that keeps things moving.
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <b>What you get</b>
              <br />• A modern site (Next.js + Material UI)
              <br />• Copy + CTAs that make sense to customers
              <br />• Email capture + basic analytics
              <br />• Ongoing updates (optional)
            </p>
            <p className={styles.p} style={{ marginTop: 8 }}>
              <b>How it works</b>
              <br />1) Intake (assets + goals)
              <br />2) Build + polish
              <br />3) Launch
              <br />4) Weekly improvements
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

          <div className={styles.card}>
            <UiHighlights />
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

