"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { supabaseClient } from "../../lib/supabase";
import { avatarUrl } from "../../lib/avatars";

import { WalletBar } from "./wallet";
import { emptyOwners, loadState, saveState } from "./state";

import { Shell, Topbar, Card, Box, Button, Chip, Stack, TextField, Typography } from "../ui";

function pickCrownIndex() {
  return 1 + Math.floor(Math.random() * 98);
}

export default function PlayPage() {
  const supabase = useMemo(() => supabaseClient(), []);
  const { address, isConnected } = useAccount();

  const [handle, setHandle] = useState("player");
  const [avatarSeed, setAvatarSeed] = useState("player");
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState("");
  const [crownIdx, setCrownIdx] = useState(pickCrownIndex());
  const [owners, setOwners] = useState(() => emptyOwners());

  // Better defaults once a wallet exists
  useEffect(() => {
    if (!address) return;
    setAvatarSeed((cur) => (cur === "player" ? address : cur));
    setHandle((cur) => (cur === "player" ? `@${address.slice(2, 8)}` : cur));
  }, [address]);

  useEffect(() => {
    if (!supabase) {
      setStatus("Supabase not connected (ok for local mode). Add env vars in Vercel for multiplayer.");
      return;
    }

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
    <Shell>
      <Topbar
        left={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <img
              src="/hot-potato-logo.png"
              alt="Hot Potato Crown"
              style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }}
            />
            <Box>
              <Chip label="PLAY" size="small" />
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, lineHeight: 1.05 }}>
                Hot Potato Crown
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Steal the crown tile. Hold it. Win.
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Button component="a" href="/" variant="outlined">
            Home
          </Button>
        }
      />

      <Stack spacing={2}>
        <Card title="1) Connect wallet" subtitle="Base network. This is your identity (and later, your paid entry).">
          <WalletBar />
        </Card>

        {!joined ? (
          <Card title="2) Pick a username + avatar" subtitle="This is how you show up on the leaderboard.">
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {isConnected ? (
                  <>
                    Connected: <b>{address?.slice(0, 6)}…{address?.slice(-4)}</b>
                  </>
                ) : (
                  <>Connect first, then pick your name.</>
                )}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                <TextField
                  label="Username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourname"
                  disabled={!isConnected}
                  fullWidth
                />
                <img
                  src={avatarUrl(avatarSeed)}
                  alt="avatar"
                  style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,.04)" }}
                />
              </Stack>

              <TextField
                label="Avatar seed (optional)"
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value)}
                disabled={!isConnected}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button variant="contained" onClick={join} disabled={!isConnected}>
                  Start playing
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCrownIdx(pickCrownIndex());
                    setOwners(emptyOwners());
                  }}
                >
                  Reset board
                </Button>
              </Stack>

              {status ? (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {status}
                </Typography>
              ) : null}
            </Stack>
          </Card>
        ) : (
          <Card
            title="Arena"
            subtitle="Crown tile is outlined. Capture success is 70% (for now)."
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: { xs: 0.6, sm: 0.8 },
              }}
            >
              {owners.map((o, idx) => {
                const isMine = o && address && o.toLowerCase() === address.toLowerCase();
                const isCrown = idx === crownIdx;
                return (
                  <Box
                    key={idx}
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
                    sx={{
                      aspectRatio: "1 / 1",
                      borderRadius: 1.5,
                      border: "1px solid rgba(255,255,255,0.12)",
                      bgcolor: isMine ? "rgba(116,167,255,0.16)" : "rgba(255,255,255,0.03)",
                      outline: isCrown ? "2px solid rgba(251,191,36,0.95)" : "none",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    title={o ? `occupied` : `empty`}
                  />
                );
              })}
            </Box>

            {status ? (
              <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.85 }}>
                {status}
              </Typography>
            ) : null}

            <Typography variant="caption" sx={{ display: "block", mt: 1.5, opacity: 0.6 }}>
              MVP note: game rules + payouts not live yet.
            </Typography>
          </Card>
        )}
      </Stack>
    </Shell>
  );
}
