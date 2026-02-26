"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { supabaseClient } from "../../lib/supabase";

import { Box, Button, Card, Chip, Stack, TextField, Typography } from "../ui";

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.07;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 250);
  } catch {
    // ignore
  }
}

export function HotPotatoGame() {
  const supabase = useMemo(() => supabaseClient(), []);
  const { address, isConnected } = useAccount();

  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("");
  const [beeped, setBeeped] = useState(false);

  const addr = address ? address.toLowerCase() : null;

  // Load players + state + subscribe
  useEffect(() => {
    if (!supabase) {
      setStatus("Supabase not connected yet.");
      return;
    }

    const load = async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("arc_hotpotato_players").select("address,created_at").order("created_at", { ascending: true }),
        supabase.from("arc_hotpotato_state").select("*").eq("id", "global").single(),
      ]);
      setPlayers(p || []);
      setState(s || null);
    };

    load();

    const ch1 = supabase
      .channel("arc_hotpotato")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arc_hotpotato_players" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arc_hotpotato_state", filter: "id=eq.global" },
        (payload) => {
          setState(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
    };
  }, [supabase]);

  // Alarm when game starts
  useEffect(() => {
    if (!state?.started_at) return;
    if (beeped) return;
    beep();
    setBeeped(true);
  }, [state?.started_at, beeped]);

  async function doJoin() {
    if (!isConnected || !addr) {
      setStatus("Connect your wallet first.");
      return;
    }
    setStatus("");

    // optional: save username via /api/profile (reuses existing)
    if (username.trim()) {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, username: username.trim(), avatarSeed: addr, avatarUrl: null }),
      }).catch(() => null);
    }

    const res = await fetch("/api/game/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(j.error || "Join failed");
      return;
    }
    setJoined(true);
  }

  async function clickMine() {
    if (!addr) return;
    setStatus("");
    const res = await fetch("/api/game/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(j.error || "Action failed");
      return;
    }
    if (j.loser) {
      setStatus(j.loser === addr ? "You lost." : "Round finished.");
    }
  }

  const count = players.length;
  const started = !!state?.started_at;
  const endsAt = state?.countdown_ends_at ? Date.parse(state.countdown_ends_at) : null;
  const now = Date.now();
  const secondsLeft = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : null;
  const holder = state?.potato_holder;
  const isHolder = holder && addr && holder.toLowerCase() === addr;

  return (
    <Stack spacing={2}>
      <Card title="Hot Potato (10 players)" subtitle="Click your tile if it turns red. Don’t hold it >5s.">
        <Stack spacing={1.2}>
          <div className="small">
            Players: <b>{count}/10</b> {started ? "· round live" : "· waiting"}
          </div>

          {!joined ? (
            <Stack spacing={1.2}>
              <TextField
                label="Username (optional for now)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isConnected}
              />
              <Button variant="contained" onClick={doJoin} disabled={!isConnected}>
                Join lobby
              </Button>
              {status ? (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {status}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {started ? (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip label={`Countdown: ${secondsLeft ?? "?"}s`} />
              {state?.loser ? <Chip color="error" label={`Loser: ${state.loser.slice(0, 6)}…`} /> : null}
              {isHolder ? <Chip color="error" label="YOU HAVE IT" /> : <Chip label="Safe" />}
            </Stack>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mt: 1,
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const p = players[i];
              const a = p?.address;
              const mine = a && addr && a.toLowerCase() === addr;
              const hasPotato = a && holder && a.toLowerCase() === holder.toLowerCase();
              const bg = !a
                ? "rgba(255,255,255,0.03)"
                : hasPotato
                  ? "rgba(239,68,68,0.22)"
                  : "rgba(116,167,255,0.10)";

              return (
                <Box
                  key={i}
                  onClick={mine && started && !state?.loser ? clickMine : undefined}
                  sx={{
                    aspectRatio: "1 / 1",
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.12)",
                    bgcolor: bg,
                    cursor: mine && started && !state?.loser ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 0.5,
                    userSelect: "none",
                  }}
                  title={a || "empty"}
                >
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {a ? (mine ? "YOU" : a.slice(2, 6).toUpperCase()) : "OPEN"}
                  </Typography>
                  {hasPotato ? <Typography variant="caption">HOT</Typography> : null}
                </Box>
              );
            })}
          </Box>

          {status ? (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {status}
            </Typography>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}
