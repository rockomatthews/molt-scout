import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/8c3f62fa-efc0-4b0e-8c5e-95e103d204e8.png"
            alt="The Bot Team logo"
            width={34}
            height={34}
            priority
          />
          <span className={styles.brandText}>The Bot Team</span>
        </Link>

        <nav className={styles.nav}>
          <Link className={styles.link} href="/services">
            Services
          </Link>
          <Link className={styles.link} href="/pricing">
            Pricing
          </Link>
          <Link className={styles.link} href="/proof">
            Proof
          </Link>
          <Link className={styles.link} href="/daily">
            Daily
          </Link>
          <Link className={styles.link} href="/trade-school">
            Trade School
          </Link>
          <Link className={styles.link} href="/team">
            Team
          </Link>
          <a
            className={styles.link}
            href="https://x.com/TheBotTeamHQ"
            target="_blank"
            rel="noreferrer"
          >
            X
          </a>
        </nav>
      </div>
    </header>
  );
}
