"use client";

import * as React from "react";
import { Box, Button, Container, Stack, Typography, Card, CardContent } from "@mui/material";

async function startCheckout(tier: "pro" | "teams") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error ?? "checkout failed");
  window.location.href = j.url;
}

export default function SubscribePage() {
  const [err, setErr] = React.useState<string | null>(null);

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 860 }}>
        <Typography variant="h3" fontWeight={900}>
          Subscribe (monthly)
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Subscription is for <b>updates + new drops + support</b>. Token holders get access to the Pro Pack downloads.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography fontWeight={900}>Pro</Typography>
                <Typography sx={{ opacity: 0.8 }}>Monthly updates + new templates</Typography>
                <Button variant="contained" onClick={() => startCheckout("pro").catch((e) => setErr(String(e.message)))}>
                  Subscribe (Pro)
                </Button>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography fontWeight={900}>Teams</Typography>
                <Typography sx={{ opacity: 0.8 }}>Priority support + custom integrations (later)</Typography>
                <Button
                  variant="contained"
                  onClick={() => startCheckout("teams").catch((e) => setErr(String(e.message)))}
                >
                  Subscribe (Teams)
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {err && (
          <Box sx={{ p: 2, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
            <Typography sx={{ opacity: 0.8 }}>Error: {err}</Typography>
            <Typography sx={{ opacity: 0.7, mt: 1 }}>
              Stripe env vars may not be set yet. We can finish wiring when you add them in Vercel.
            </Typography>
          </Box>
        )}

        <Button href="/" variant="outlined" sx={{ width: "fit-content" }}>
          Back
        </Button>
      </Stack>
    </Container>
  );
}
