import Link from "next/link";
import { supabasePublic } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sb = supabasePublic();

  // Site should build even before Supabase exists.
  const topic = sb
    ? await sb
        .from("crp_topics")
        .select("slug,title,description,solved")
        .eq("slug", "cure-cancer")
        .maybeSingle()
    : null;

  const topicRow = topic?.data ?? null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <div style={{ opacity: 0.75, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
            Community Research Pool
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: 42, letterSpacing: -0.7 }}>Curing cancer (public deltas)</h1>
        </div>
        <div style={{ opacity: 0.75, fontSize: 13 }}>v0 — one baked topic</div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
          background: "radial-gradient(120% 140% at 50% 0%, rgba(34,197,94,0.14) 0%, rgba(0,0,0,0) 60%)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16 }}>SOLVED definition (Milestone B)</div>
        <div style={{ opacity: 0.85, marginTop: 8, lineHeight: 1.55 }}>
          A clearly identified mechanism + target class that generalizes, with Phase 2 efficacy signals across multiple tumor
          types, plus validated biomarkers for responders.
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            padding: 16,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontWeight: 800 }}>Status</div>
          {!sb ? (
            <div style={{ opacity: 0.85, marginTop: 8, lineHeight: 1.55 }}>
              Supabase env vars are not set yet. That’s okay — the site is deployable before the DB exists.
              <div style={{ marginTop: 8, opacity: 0.85 }}>
                Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel when ready.
              </div>
            </div>
          ) : topicRow ? (
            <div style={{ opacity: 0.9, marginTop: 8, lineHeight: 1.55 }}>
              Connected to Supabase. Topic row found: <code>{topicRow.slug}</code>. Solved: <b>{String(topicRow.solved)}</b>
            </div>
          ) : (
            <div style={{ opacity: 0.85, marginTop: 8 }}>Connected to Supabase, but topic table/seed not found yet.</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/digest"
            style={{
              display: "inline-block",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              background: "#1f8f57",
              color: "#06160d",
              fontWeight: 900,
            }}
          >
            View today’s digest
          </Link>

          <a
            href="https://clawhub.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.08) 100%)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#e9f5ec",
              fontWeight: 900,
            }}
          >
            Download OpenClaw skill
          </a>

          <Link
            href="/api/topic"
            style={{
              display: "inline-block",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#e9f5ec",
              fontWeight: 700,
            }}
          >
            API: topic
          </Link>
        </div>

        <div style={{ opacity: 0.8, marginTop: 6, lineHeight: 1.5 }}>
          Install command:
          <div
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.35)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: 13,
            }}
          >
            clawhub install community-research-pool-cure-cancer
          </div>
        </div>
      </div>

      <div style={{ opacity: 0.7, fontSize: 13, lineHeight: 1.6 }}>
        Safety: research-only. No medical advice. Every finding must cite sources.
      </div>
    </div>
  );
}
