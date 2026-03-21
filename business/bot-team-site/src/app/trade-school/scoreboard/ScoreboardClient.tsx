"use client";

import { useEffect, useMemo, useState } from "react";

type Rolling = { pnl: number; trades: number; winRate: number };
type DayRow = {
  day: string;
  realizedPnlUsd: number;
  tradesClosed: number;
  wins: number;
  losses: number;
  avgWinUsd: number;
  avgLossUsd: number;
  biggestWinUsd: number;
  biggestLossUsd: number;
};

type Scoreboard = {
  updatedAt?: string;
  configFingerprint?: string;
  rolling3d?: Rolling;
  rolling7d?: Rolling;
  daily?: DayRow[];
};

function fmtUsd(x: number) {
  const s = x >= 0 ? "+" : "";
  return `${s}$${x.toFixed(2)}`;
}

function pillStyle(good: boolean) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: `1px solid ${good ? "rgba(80,200,120,0.45)" : "rgba(255,90,90,0.45)"}`,
    background: good ? "rgba(80,200,120,0.12)" : "rgba(255,90,90,0.10)",
  } as const;
}

export default function ScoreboardClient() {
  const [data, setData] = useState<Scoreboard | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/trade-school/scoreboard.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`http_${res.status}`);
        setData((await res.json()) as any);
      } catch (e: any) {
        setErr(String(e?.message || e));
      }
    })();
  }, []);

  const daily = useMemo(() => (data?.daily || []).slice().reverse().slice(0, 14), [data]);

  if (err) {
    return (
      <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Scoreboard JSON not available</div>
        <div style={{ opacity: 0.8, fontSize: 13 }}>Error: {err}</div>
        <div style={{ opacity: 0.7, fontSize: 13, marginTop: 10 }}>
          (We can still render the markdown, but JSON gives the nice UI.)
        </div>
      </div>
    );
  }

  if (!data) return <div style={{ opacity: 0.8 }}>Loading…</div>;

  const r3 = data.rolling3d;
  const r7 = data.rolling7d;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
          <div style={{ opacity: 0.8, fontSize: 13 }}>Rolling 3D</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{r3 ? fmtUsd(r3.pnl) : "—"}</div>
          <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
            Trades {r3?.trades ?? "—"} · Win {r3 ? `${r3.winRate.toFixed(1)}%` : "—"}
          </div>
          {r3 && <div style={{ marginTop: 10, ...pillStyle(r3.pnl >= 0) }}>{r3.pnl >= 0 ? "Positive" : "Negative"}</div>}
        </div>

        <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
          <div style={{ opacity: 0.8, fontSize: 13 }}>Rolling 7D</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{r7 ? fmtUsd(r7.pnl) : "—"}</div>
          <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
            Trades {r7?.trades ?? "—"} · Win {r7 ? `${r7.winRate.toFixed(1)}%` : "—"}
          </div>
          {r7 && <div style={{ marginTop: 10, ...pillStyle(r7.pnl >= 0) }}>{r7.pnl >= 0 ? "Positive" : "Negative"}</div>}
        </div>
      </div>

      <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700 }}>Daily (last 14)</div>
            <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
              Updated {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"} · Config {data.configFingerprint || "—"}
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.85 }}>
                <th style={{ padding: "8px 6px" }}>Day</th>
                <th style={{ padding: "8px 6px" }}>Realized</th>
                <th style={{ padding: "8px 6px" }}>Closed</th>
                <th style={{ padding: "8px 6px" }}>Win%</th>
                <th style={{ padding: "8px 6px" }}>Best</th>
                <th style={{ padding: "8px 6px" }}>Worst</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => {
                const wr = d.tradesClosed ? (d.wins / d.tradesClosed) * 100 : 0;
                return (
                  <tr key={d.day} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>{d.day}</td>
                    <td style={{ padding: "8px 6px", color: d.realizedPnlUsd >= 0 ? "#7CFFB2" : "#FF8A8A" }}>
                      {fmtUsd(d.realizedPnlUsd)}
                    </td>
                    <td style={{ padding: "8px 6px" }}>{d.tradesClosed}</td>
                    <td style={{ padding: "8px 6px" }}>{wr.toFixed(1)}%</td>
                    <td style={{ padding: "8px 6px" }}>{fmtUsd(d.biggestWinUsd)}</td>
                    <td style={{ padding: "8px 6px" }}>{fmtUsd(d.biggestLossUsd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
