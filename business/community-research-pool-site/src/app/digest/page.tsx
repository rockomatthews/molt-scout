import { supabasePublic } from "../../lib/supabase";

export const dynamic = "force-dynamic";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DigestPage() {
  const sb = supabasePublic();
  const today = isoDate(new Date());

  if (!sb) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Digest</h1>
        <p style={{ opacity: 0.85 }}>Supabase env vars not set yet. Deploy is fine — connect Supabase when ready.</p>
      </div>
    );
  }

  const runs = await sb
    .from("crp_runs")
    .select("id, run_date, contributor_id, summary, created_at")
    .eq("topic_slug", "cure-cancer")
    .eq("run_date", today)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ marginTop: 0 }}>Today’s digest</h1>
      <div style={{ opacity: 0.8 }}>Topic: cure-cancer · Date: {today}</div>

      {runs.error ? (
        <div style={{ opacity: 0.85 }}>
          Error loading runs. Likely schema not applied yet. ({runs.error.message})
        </div>
      ) : runs.data?.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {runs.data.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 16,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ fontWeight: 800 }}>Run {r.id}</div>
              <div style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>
                contributor: {r.contributor_id} · {new Date(r.created_at).toLocaleString()}
              </div>
              <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{r.summary}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ opacity: 0.85 }}>No runs yet today.</div>
      )}
    </div>
  );
}
