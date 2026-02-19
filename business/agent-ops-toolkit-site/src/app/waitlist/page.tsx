"use client";

import * as React from "react";
import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

export default function WaitlistPage() {
  const [wallet, setWallet] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  async function submit() {
    setStatus("Submitting…");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet }),
    });
    const text = await res.text();
    setStatus(res.ok ? text : `Error: ${text}`);
  }

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 860 }}>
        <Typography variant="h3" fontWeight={900}>
          AOT Waitlist (Base)
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          Paste your Base wallet address to join the free airdrop waitlist. That’s it.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <TextField
                label="Base wallet address"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x…"
              />
              <Box>
                <Button variant="contained" onClick={submit}>
                  Join waitlist
                </Button>
              </Box>
              {status && <Typography sx={{ opacity: 0.8 }}>{status}</Typography>}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={0.75}>
          <Typography fontWeight={900}>Safety</Typography>
          <Typography sx={{ opacity: 0.75 }}>
            • No payment required. We will never ask you to send funds to join the waitlist.
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            • Never share your seed phrase. We only need your public wallet address.
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            • We will never DM you first.
          </Typography>
        </Stack>

        <Button href="/" variant="text" sx={{ width: "fit-content" }}>
          Back
        </Button>
      </Stack>
    </Container>
  );
}
