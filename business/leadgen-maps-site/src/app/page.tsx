import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ margin: 0 }}>LeadGen Maps</h1>
      <p style={{ opacity: 0.8 }}>Host and share lead lists (CSV/JSON) generated from niche + city.</p>

      <section style={{ marginTop: 18, padding: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Latest list</h2>
        <p>
          <Link href="/leads">View leads →</Link>
        </p>
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 0 }}>
          This site serves <code>/public/leads/latest.json</code> + <code>/public/leads/latest.csv</code>. Update those files and redeploy.
        </p>
      </section>
    </main>
  );
}
