"use client";

import { useState } from "react";
import { Container, Stack, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { createClient } from "../supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Access password gate removed
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<"info" | "error" | "success">("info");

  async function onRegister() {
    setStatus("Working...");
    setSeverity("info");

    const supabase = createClient();
    if (!supabase) {
      setStatus("Supabase not connected yet. Deploy on Vercel + add Supabase integration first.");
      setSeverity("error");
      return;
    }

    // Access password gate removed (open registration)
    const emailRedirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (error) {
      setStatus(error.message);
      setSeverity("error");
      return;
    }

    setStatus("Registered. Check email if confirmation is enabled, then open /chat.");
    setSeverity("success");
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>
          Register
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1.5}>
            {/* Access password removed */}
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" onClick={onRegister}>
                Create account
              </Button>
              <Button variant="outlined" href="/chat">
                Go to chat
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {status ? <Alert severity={severity}>{status}</Alert> : null}
      </Stack>
    </Container>
  );
}
