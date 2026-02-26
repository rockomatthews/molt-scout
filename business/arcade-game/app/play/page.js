"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../../lib/supabase";

function pickCrownIndex() {
  return 1 + Math.floor(Math.random() * 98);
}

export default function PlayPage() {
  const supabase = useMemo(() => supabaseClient(), []);
  const [handle, setHandle] = useState("player");
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("");
  const [crownIdx, setCrownIdx] = useState(pickCrownIndex());
  const [tiles, setTiles] = useState(() => Array.from({ length: 100 }).map((_, i) => ({ idx: i, owner: null })));

  useEffect(() => {
    if (!supabase) {
      setStatus(
        "Supabase not connected yet (okay for MVP local mode). Add Supabase env vars in Vercel when ready."
      );
    }
  }, [supabase]);

  function join() {
    const h = handle.trim().replace(/\s+/g, "_");
    if (!h) return;
    setHandle(h.startsWith("@") ? h : `@${h}`);
    setJoined(true);
    setStatus("");
  }

  function capture(i) {
    if (!joined) {
      setStatus("Pick a handle and Join first.");
      return;
    }

    const ok = Math.random() < 0.7;
    if (!ok) {
      setStatus("Missed. Try again.");
      return;
    }

    setTiles((cur) => cur.map((t) => (t.idx === i ? { ...t, owner: handle } : t)));
    if (i === crownIdx) {
      setStatus(`You stole the Crown. Hold it.`);
    } else {
      setStatus("");
    }
  }

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
            <div className="badge">PLAY · LOCAL MVP</div>
            <div className="small" style={{ marginTop: 6 }}>
              Steal the Crown tile. Hold it. Win.
            </div>
          </div>
        </div>
        <a className="button" href="/">
          Home
        </a>
      </div>

      {!joined ? (
        <div className="card" style={{ maxWidth: 520 }}>
          <b>Choose your handle</b>
          <div style={{ marginTop: 10 }}>
            <input className="input" value={handle} onChange={(e) => setHandle(e.target.value)} />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button className="button" onClick={join}>
              Join
            </button>
          </div>
          {status ? <div className="small" style={{ marginTop: 10 }}>{status}</div> : null}
        </div>
      ) : (
        <>
          <div className="small" style={{ marginBottom: 10 }}>
            You are <b>{handle}</b>. Click tiles to capture. Crown tile is outlined.
          </div>

          <div className="grid">
            {tiles.map((t) => {
              const cls = ["tile"];
              if (t.owner === handle) cls.push("me");
              if (t.idx === crownIdx) cls.push("crown");
              return (
                <div key={t.idx} className={cls.join(" ")} onClick={() => capture(t.idx)}>
                  {t.owner ? t.owner.slice(0, 2) : ""}
                </div>
              );
            })}
          </div>

          {status ? <div className="small" style={{ marginTop: 12 }}>{status}</div> : null}

          <div className="card" style={{ marginTop: 16 }}>
            <b>Next step (after Supabase)</b>
            <div className="small" style={{ marginTop: 10, lineHeight: 1.6 }}>
              • Persist the board + crown holder in Postgres
              <br />• Broadcast captures via Realtime
              <br />• 3-minute rounds + leaderboard
            </div>
          </div>
        </>
      )}
    </div>
  );
}
