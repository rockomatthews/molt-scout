"use client";

import { useState } from "react";
import { Container, Stack, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { createClient } from "../supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<"info" | "error" | "success">("info");

  async function onLogin() {
    setStatus("Working...");
    setSeverity("info");

    const supabase = createClient();
    if (!supabase) {
      setStatus("Supabase not connected yet.");
      setSeverity("error");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
      setSeverity("error");
      return;
    }

    setStatus("Logged in. Redirecting to chat...");
    setSeverity("success");
    window.location.href = "/chat";
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>
          Login
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1.5}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" onClick={onLogin}>
                Login
              </Button>
              <Button variant="outlined" href="/register">
                Register
              </Button>
              <Button variant="text" href="/">
                Home
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {status ? <Alert severity={severity}>{status}</Alert> : null}
      </Stack>
    </Container>
  );
}
