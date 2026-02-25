"use client";

import { useEffect, useState } from "react";
import { Container, Stack, Typography, Paper, CircularProgress } from "@mui/material";
import { createClient } from "../../supabase/client";

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Finishing sign-in...");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      if (!supabase) {
        setMsg("Supabase not connected.");
        return;
      }

      try {
        // Supabase sends ?code=... for email confirmations and magic links.
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        setMsg("Signed in. Redirecting...");
        window.location.replace("/chat");
      } catch (e: any) {
        setMsg(e?.message || "Auth callback failed");
      }
    })();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 3, bgcolor: "rgba(255,255,255,0.03)" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>{msg}</Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
