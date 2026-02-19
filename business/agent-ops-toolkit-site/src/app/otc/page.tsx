"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

const USDC_RECEIVE = "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b" as const;
const AOT_TOKEN = process.env.NEXT_PUBLIC_AOT_TOKEN_ADDRESS ?? "(set NEXT_PUBLIC_AOT_TOKEN_ADDRESS)";

const tiers = [
  { name: "Pro", usdc: 49, aot: 100_000, note: "Unlocks Pro Pack" },
  { name: "Teams", usdc: 199, aot: 1_000_000, note: "Bigger unlock + priority support later" },
] as const;

export default function OtcPage() {
  const [wallet, setWallet] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  async function submit() {
    setStatus("Submitting…");
    const res = await fetch("/api/otc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet, txHash }),
    });
    const text = await res.text();
    setStatus(text);
  }

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 920 }}>
        <Typography variant="h3" fontWeight={900}>
          OTC: Buy AOT with USDC (Base)
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Send USDC on Base to the address below, then submit your tx hash and the wallet that should receive AOT.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={800}>Send USDC (Base) to:</Typography>
              <Typography sx={{ fontFamily: "monospace" }}>{USDC_RECEIVE}</Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Token gated utility: hold AOT to unlock Pro assets at <code>/token</code>.
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                AOT contract: <span style={{ fontFamily: "monospace" }}>{AOT_TOKEN}</span>
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="h5" fontWeight={900} sx={{ pt: 1 }}>
          Tiers
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {tiers.map((t) => (
            <Card key={t.name} variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Typography fontWeight={900}>{t.name}</Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    {t.usdc} USDC → {t.aot.toLocaleString()} AOT
                  </Typography>
                  <Typography sx={{ opacity: 0.7 }}>{t.note}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Typography variant="h5" fontWeight={900} sx={{ pt: 2 }}>
          Submit payment
        </Typography>

        <Stack spacing={1.5}>
          <TextField
            label="Receiving wallet address (Base)"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
          />
          <TextField
            label="USDC transfer tx hash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x…"
          />
          <Box>
            <Button variant="contained" onClick={submit}>
              Submit
            </Button>
            <Button href="/token" variant="text" sx={{ ml: 1 }}>
              Check token gate
            </Button>
          </Box>
          {status && <Typography sx={{ opacity: 0.8 }}>{status}</Typography>}
        </Stack>

        <Typography sx={{ opacity: 0.7, pt: 2 }}>
          Note: the first version confirms your tx onchain and logs the request. Token distribution is processed manually
          until we add automated delivery.
        </Typography>
      </Stack>
    </Container>
  );
}
