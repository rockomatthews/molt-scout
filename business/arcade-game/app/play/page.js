"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { supabaseClient } from "../../lib/supabase";
import { avatarUrl } from "../../lib/avatars";
import { WalletBar } from "./wallet";
import { emptyOwners, loadState, saveState } from "./state";

function pickCrownIndex() {
  return 1 + Math.floor(Math.random() * 98);
}

export default function PlayPage() {
  const supabase = useMemo(() => supabaseClient(), []);
  const { address, isConnected } = useAccount();

  const [handle, setHandle] = useState("player");
  const [avatarSeed, setAvatarSeed] = useState("player");

  // Improve first impression: default avatar seed follows the wallet
  useEffect(() => {
    if (!address) return;
    setAvatarSeed((cur) => (cur === "player" ? address : cur));
    setHandle((cur) => (cur === "player" ? `@${address.slice(2, 8)}` : cur));
  }, [address]);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("");
  const [crownIdx, setCrownIdx] = useState(pickCrownIndex());
  const [owners, setOwners] = useState(() => emptyOwners());

  useEffect(() => {
    if (!supabase) {
      setStatus(
        "Supabase not connected yet (local-only mode). Add Supabase env vars in Vercel when ready."
      );
      return;
    }

    // Load state once + subscribe to updates
    (async () => {
      try {
        const s = await loadState();
        if (!s) return;
        setCrownIdx(s.crown_idx);
        const nextOwners = Array.isArray(s.tiles?.owners) ? s.tiles.owners : emptyOwners();
        setOwners(nextOwners);
      } catch (e) {
        setStatus(String(e?.message || e));
      }
    })();

    const channel = supabase
      .channel("arc_game_state")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "arc_game_state", filter: "id=eq.global" },
        (payload) => {
          const s = payload.new;
          if (!s) return;
          setCrownIdx(s.crown_idx);
          const nextOwners = Array.isArray(s.tiles?.owners) ? s.tiles.owners : emptyOwners();
          setOwners(nextOwners);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function join() {
    if (!isConnected || !address) {
      setStatus("Connect your wallet first.");
      return;
    }

    const h = handle.trim().replace(/\s+/g, "_");
    if (!h) return;

    const username = h.startsWith("@") ? h : `@${h}`;
    setHandle(username);

    // Upsert profile (MVP: no signature yet)
    if (supabase) {
      try {
        await supabase
          .from("arc_profiles")
          .upsert({ address, username, avatar_seed: avatarSeed }, { onConflict: "address" });
      } catch (e) {
        setStatus(String(e?.message || e));
      }
    }

    setJoined(true);
    setStatus("");
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/hot-potato-logo.png"
            alt="Hot Potato Crown"
            style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover" }}
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

      <div className="card" style={{ marginBottom: 14, maxWidth: 760 }}>
        <div className="kv">
          <div>
            <div className="h2">1) Connect wallet</div>
            <div className="small">Base network. This is your identity (and later, your paid entry).</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <WalletBar />
        </div>
      </div>

      {!joined ? (
        <div className="card" style={{ maxWidth: 760 }}>
          <div className="h2">2) Pick a username + avatar</div>
          <div className="small" style={{ marginTop: 6 }}>
            {isConnected ? (
              <>Connected: <b>{address?.slice(0, 6)}…{address?.slice(-4)}</b></>
            ) : (
              <>Connect first, then pick your name.</>
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 80px",
              gap: 12,
              alignItems: "center",
            }}
          >
            <input
              className="input"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@yourname"
              disabled={!isConnected}
            />
            <img
              src={avatarUrl(avatarSeed)}
              alt="avatar"
              style={{ width: 80, height: 80, borderRadius: 16, background: "rgba(255,255,255,.04)" }}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              className="input"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              placeholder="avatar seed (optional)"
              disabled={!isConnected}
            />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="button" onClick={join} disabled={!isConnected}>
              Start playing
            </button>
            <button
              className="button"
              onClick={() => {
                setCrownIdx(pickCrownIndex());
                setOwners(emptyOwners());
              }}
            >
              Reset board
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
            {owners.map((o, idx) => {
              const cls = ["tile"];
              if (o === address) cls.push("me");
              if (idx === crownIdx) cls.push("crown");
              return (
                <div
                  key={idx}
                  className={cls.join(" ")}
                  onClick={async () => {
                    if (!address) return;
                    const ok = Math.random() < 0.7;
                    if (!ok) {
                      setStatus("Missed. Try again.");
                      return;
                    }
                    const nextOwners = owners.slice();
                    nextOwners[idx] = address;
                    setOwners(nextOwners);
                    setStatus(idx === crownIdx ? "You stole the Crown. Hold it." : "");

                    // Persist to Supabase if connected
                    if (supabase) {
                      try {
                        await saveState({
                          crown_idx: crownIdx,
                          round_ends_at: null,
                          tiles: { owners: nextOwners },
                        });
                      } catch (e) {
                        setStatus(String(e?.message || e));
                      }
                    }
                  }}
                >
                  {o ? "•" : ""}
                </div>
              );
            })}
          </div>

          {status ? <div className="small" style={{ marginTop: 12 }}>{status}</div> : null}

          <div className="card" style={{ marginTop: 16 }}>
            <b>Next step</b>
            <div className="small" style={{ marginTop: 10, lineHeight: 1.6 }}>
              • rounds (3 min) + crown points
              <br />• leaderboard
              <br />• paid entry (USDC on Base) after fun is proven
            </div>
          </div>
        </>
      )}
    </div>
  );
}
