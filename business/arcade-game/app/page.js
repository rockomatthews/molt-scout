import Link from "next/link";

export default function Home() {
  return (
    <div className="shell">
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/hot-potato-logo.png"
            alt="Hot Potato Crown"
            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
          />
          <div>
            <div className="badge">ARCADE · MVP</div>
            <div className="small" style={{ marginTop: 6 }}>
              Hot Potato Crown
            </div>
          </div>
        </div>
        <div className="small">Bot Team / Gaming</div>
      </div>

      <h1 className="h1">Hot Potato Crown</h1>
      <p className="p">
        A fast tile-control game: steal the Crown tile, hold it, and win the round. Skill + randomness,
        3-minute rounds, public leaderboard.
      </p>

      <div className="row">
        <div className="card">
          <b>How it works</b>
          <div className="small" style={{ marginTop: 10, lineHeight: 1.6 }}>
            • 10×10 grid (100 tiles)
            <br />• One tile is the Crown
            <br />• Capture the Crown → become the holder
            <br />• Hold it to earn points until the round ends
          </div>
        </div>
        <div className="card">
          <b>Play</b>
          <div className="small" style={{ marginTop: 10, lineHeight: 1.6 }}>
            MVP is free to test. Paid rounds come after we confirm it’s fun.
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="button" href="/play">
              Enter arena
            </Link>
            <a className="button" href="https://takeover.fun" target="_blank" rel="noopener noreferrer">
              Inspiration (Takeover) ↗
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }} className="small">
        Deploy notes: connect Supabase in Vercel (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY).
      </div>
    </div>
  );
}
