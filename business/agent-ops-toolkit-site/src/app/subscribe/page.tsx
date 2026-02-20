"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const RECEIVE = process.env.NEXT_PUBLIC_USDC_RECEIVE_ADDRESS ?? "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b";
const PRO = Number(process.env.NEXT_PUBLIC_USDC_PRO_MONTHLY ?? "49");
const TEAMS = Number(process.env.NEXT_PUBLIC_USDC_TEAMS_MONTHLY ?? "199");

export default function SubscribePage() {
  const [wallet, setWallet] = React.useState("");
  const [tier, setTier] = React.useState<"pro" | "teams">("pro");
  const [status, setStatus] = React.useState<string | null>(null);

  async function claim() {
    setStatus("Checking payment…");
    const res = await fetch("/api/subscribe/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet, tier }),
    });
    const text = await res.text();
    setStatus(res.ok ? text : `Error: ${text}`);
  }

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 900 }}>
        <Typography variant="h3" fontWeight={900}>
          Subscribe (USDC on Base)
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          We do <b>not</b> use Stripe. Subscribe by sending USDC on Base.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={900}>Send USDC (Base) to:</Typography>
              <Typography sx={{ fontFamily: "monospace" }}>{RECEIVE}</Typography>
              <Typography sx={{ opacity: 0.75 }}>
                Pro: {PRO} USDC / month · Teams: {TEAMS} USDC / month
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <Typography fontWeight={900}>Activate after you pay</Typography>
              <Typography sx={{ opacity: 0.75 }}>
                Paste the wallet you paid from. We’ll detect your recent USDC payment.
              </Typography>

              <TextField
                label="Your Base wallet address"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x…"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant={tier === "pro" ? "contained" : "outlined"} onClick={() => setTier("pro")}>
                  Pro ({PRO} USDC)
                </Button>
                <Button variant={tier === "teams" ? "contained" : "outlined"} onClick={() => setTier("teams")}>
                  Teams ({TEAMS} USDC)
                </Button>
                <Button variant="contained" onClick={claim}>
                  I paid — activate
                </Button>
              </Stack>

              {status && <Typography sx={{ opacity: 0.85 }}>{status}</Typography>}

              <Typography sx={{ opacity: 0.7, fontSize: 13, pt: 1 }}>
                Safety: We will never ask for your seed phrase. Only enter a public wallet address.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Button href="/" variant="outlined">
            Back
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
