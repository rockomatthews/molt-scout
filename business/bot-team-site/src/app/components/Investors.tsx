"use client";

import React, { useEffect, useState } from "react";

type EquityPoint = {
  ts: string;
  paperBalanceUsd: number;
  mtmPnlUsd?: number;
  fills?: number;
};

type LoopJson = {
  ts?: string;
  mm?: {
    account?: { paperBalanceUsd?: number; cashUsd?: number; startCashUsd?: number };
    inventoryMtmUsd?: number;
  };
  equityCurve?: EquityPoint[];
};

function fmtUsd(x?: number) {
  if (typeof x !== "number" || !Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function pct(a?: number, b?: number) {
  if (typeof a !== "number" || typeof b !== "number" || !Number.isFinite(a) || !Number.isFinite(b) || b === 0)
    return "—";
  const p = (a / b) * 100;
  const s = p >= 0 ? "+" : "";
  return `${s}${p.toFixed(2)}%`;
}

export default function Investors() {
  const [data, setData] = useState<LoopJson | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setErr(null);
        // Fetch the latest loop snapshot from the alpha-engine repo (raw GitHub).
        // This is a simple bridge so /investors works immediately.
        // Later we can swap to a proper API/Supabase source.
        const url =
          "https://raw.githubusercontent.com/rockomatthews/molt-scout/master/business/alpha-engine/logs/polymarket_loop.json";
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`fetch failed ${r.status}`);
        const j = (await r.json()) as LoopJson;
        setData(j);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
      }
    };

    run();
    const t = setInterval(run, 30_000);
    return () => clearInterval(t);
  }, []);

  const curve = data?.equityCurve || [];
  const latest = curve.length ? curve[curve.length - 1] : null;
  const prev = curve.length > 1 ? curve[curve.length - 2] : null;

  const equity = latest?.paperBalanceUsd ?? data?.mm?.account?.paperBalanceUsd;
  const delta = latest && prev ? latest.paperBalanceUsd - prev.paperBalanceUsd : undefined;

  const startCash = data?.mm?.account?.startCashUsd;
  const todaysPl = typeof equity === "number" && typeof startCash === "number" ? equity - startCash : undefined;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Investors Dashboard</h1>

      {err ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ffb4b4", background: "#fff5f5" }}>
          Couldn’t load snapshot: {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
        <Card title="Current equity" value={fmtUsd(equity)} subtitle={latest?.ts ? `as of ${latest.ts}` : (data?.ts ? `as of ${data.ts}` : "")} />
        <Card title="Δ vs last snapshot" value={fmtUsd(delta)} subtitle={delta === undefined ? "waiting for 2 points" : ""} />
        <Card title="Today’s P/L" value={fmtUsd(todaysPl)} subtitle={typeof todaysPl === "number" && typeof startCash === "number" ? pct(todaysPl, startCash) : ""} />
      </div>

      <div style={{ marginTop: 18, padding: 12, border: "1px solid #e5e7eb", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 600 }}>Balance history (tail)</div>
          <div style={{ color: "#6b7280" }}>{curve.length} pts</div>
        </div>
        <pre style={{ marginTop: 10, fontSize: 12, overflowX: "auto", whiteSpace: "pre" }}>
          {JSON.stringify(curve.slice(-20), null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 18, color: "#6b7280", fontSize: 12 }}>
        Note: this page is currently reading the latest snapshot from GitHub raw. Next step is swapping to a proper API/Supabase feed.
      </div>
    </div>
  );
}

function Card(props: { title: string; value: string; subtitle?: string }) {
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 10 }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{props.title}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{props.value}</div>
      {props.subtitle ? <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{props.subtitle}</div> : null}
    </div>
  );
}
