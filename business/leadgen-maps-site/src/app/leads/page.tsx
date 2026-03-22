"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = Record<string, any>;

type Payload = {
  query?: string;
  generatedAt?: string;
  leads?: Lead[];
};

export default function LeadsPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const q = sp.get("query");
        const limit = sp.get("limit") || "20";
        const url = q ? `/api/search?query=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}` : "/api/leads";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`http_${res.status}`);
        const j = (await res.json()) as any;
        // /api/search returns {ok, query, generatedAt, leads}
        setPayload(j?.leads ? j : (j as Payload));
      } catch (e: any) {
        setErr(String(e?.message || e));
      }
    })();
  }, []);

  const leads = payload?.leads || [];
  const cols = useMemo(() => {
    const s = new Set<string>();
    for (const l of leads.slice(0, 50)) for (const k of Object.keys(l)) s.add(k);
    return Array.from(s);
  }, [leads]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ margin: 0 }}>Leads</h1>
      <p style={{ opacity: 0.75 }}>
        {payload?.query ? <>Query: <b>{payload.query}</b> · </> : null}
        {payload?.generatedAt ? <>Generated: <b>{new Date(payload.generatedAt).toLocaleString()}</b> · </> : null}
        Count: <b>{leads.length}</b>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <a href="/leads/latest.csv" style={{ textDecoration: "underline" }}>Download CSV</a>
        <a href="/leads/latest.json" style={{ textDecoration: "underline" }}>Download JSON</a>
      </div>

      {err ? (
        <div style={{ padding: 16, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
          <div style={{ fontWeight: 700 }}>No leads yet</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Error: {err}</div>
          <div style={{ opacity: 0.75, marginTop: 10 }}>Add <code>public/leads/latest.json</code> and redeploy.</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.85 }}>
                {cols.map((c) => (
                  <th key={c} style={{ padding: "8px 6px", borderBottom: "1px solid rgba(0,0,0,0.12)" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 500).map((l, idx) => (
                <tr key={idx}>
                  {cols.map((c) => (
                    <td key={c} style={{ padding: "7px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{String(l?.[c] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
