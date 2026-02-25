"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Stack, Typography, Paper, TextField, Button, Alert } from "@mui/material";
import { createClient } from "../supabase/client";

type Profile = { id: string; handle: string; starred: boolean };

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [status, setStatus] = useState<string>("");

  async function load() {
    if (!supabase) {
      setStatus("Supabase not connected.");
      return;
    }
    const { data, error } = await supabase
      .from("cr_profiles")
      .select("id,handle,starred")
      .order("created_at", { ascending: true });
    if (error) {
      setStatus(error.message);
      return;
    }
    setProfiles((data as any) || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStar(userId: string, starred: boolean) {
    setStatus("...");
    const res = await fetch("/api/admin/star", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, userId, starred }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(json.error || "Error");
      return;
    }
    setStatus("Saved");
    await load();
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>
          Admin
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Star/unstar users. Only starred users are trusted and can trigger @cyber_randy.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1.5}>
            <TextField
              label="ADMIN_PASSWORD"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button variant="outlined" onClick={load}>
              Refresh
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            {profiles.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{p.handle}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{p.id}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    variant={p.starred ? "contained" : "outlined"}
                    onClick={() => setStar(p.id, true)}
                  >
                    Star
                  </Button>
                  <Button
                    variant={!p.starred ? "contained" : "outlined"}
                    onClick={() => setStar(p.id, false)}
                  >
                    Unstar
                  </Button>
                </div>
              </div>
            ))}
          </Stack>
        </Paper>

        {status ? <Alert severity={status === "Saved" ? "success" : "info"}>{status}</Alert> : null}
      </Stack>
    </Container>
  );
}
