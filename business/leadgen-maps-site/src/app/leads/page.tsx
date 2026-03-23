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
        const lat = sp.get("lat");
        const lng = sp.get("lng");
        const radius = sp.get("radius") || "20000";
        const url = q
          ? `/api/search?query=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}${lat && lng ? `&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}` : ""}`
          : "/api/leads";

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

  const [txHash, setTxHash] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("leadgen_txHash") || "";
  });

  const isLiveSearch = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sp = new URLSearchParams(window.location.search);
    return Boolean(sp.get("query"));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ margin: 0 }}>Leads</h1>
      <p style={{ opacity: 0.75 }}>
        {payload?.query ? <>Query: <b>{payload.query}</b> · </> : null}
        {payload?.generatedAt ? <>Generated: <b>{new Date(payload.generatedAt).toLocaleString()}</b> · </> : null}
        Count: <b>{leads.length}</b>
      </p>

      {!isLiveSearch ? (
        <section style={{ padding: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Unlock Latest</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
            Pricing: <b>$1</b> for JSON, <b>$5</b> for CSV (CSV unlocks both).
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={txHash}
              onChange={(e) => {
                setTxHash(e.target.value);
                if (typeof window !== "undefined") window.localStorage.setItem("leadgen_txHash", e.target.value);
              }}
              placeholder="Paste Base USDC transfer tx hash (0x...)"
              style={{ flex: "1 1 420px", padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.16)" }}
            />
            <a
              href={`/api/latest/quote?format=csv`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              View payment instructions
            </a>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
            <a
              href={txHash ? `/api/latest/download?format=csv&txHash=${encodeURIComponent(txHash)}` : "#"}
              style={{ textDecoration: "underline", pointerEvents: txHash ? "auto" : "none", opacity: txHash ? 1 : 0.5 }}
            >
              Download CSV ($5)
            </a>
            <a
              href={txHash ? `/api/latest/download?format=json&txHash=${encodeURIComponent(txHash)}` : "#"}
              style={{ textDecoration: "underline", pointerEvents: txHash ? "auto" : "none", opacity: txHash ? 1 : 0.5 }}
            >
              Download JSON ($1)
            </a>
          </div>

          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Note: live searches remain free; “Latest” downloads are paid.
          </div>
        </section>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <a href="/leads" style={{ textDecoration: "underline" }}>Back to Latest</a>
        </div>
      )}

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
