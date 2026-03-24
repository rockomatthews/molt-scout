"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import Link from "next/link";

export default function OrderPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string>("");

  const [form, setForm] = useState({
    businessName: "",
    niche: "",
    city: "",
    offer: "",
    website: "",
    contact: "",
    notes: "",
  });

  async function submit(tier: "starter" | "standard" | "monthly") {
    setStatus("sending");
    setErr("");
    try {
      // Create Stripe Checkout session
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, tier }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.url) throw new Error(j?.error || `http_${res.status}`);
      window.location.href = j.url;
    } catch (e: any) {
      setStatus("error");
      setErr(String(e?.message || e));
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography fontWeight={900} component={Link as any} href="/" sx={{ textDecoration: "none", color: "inherit" }}>
            Shorts Factory
          </Typography>
          <Button component={Link} href="/" variant="text">
            ← Back
          </Button>
        </Stack>

        <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
          Start an order
        </Typography>
        <Typography sx={{ opacity: 0.8, mb: 3 }}>
          Fill this out. We’ll reply with a quick confirmation + next steps.
        </Typography>

        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Stack spacing={2}>
              {status === "sent" ? <Alert severity="success">Request received.</Alert> : null}
              {status === "error" ? <Alert severity="error">Error: {err}</Alert> : null}

              <TextField label="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              <TextField label="Niche (e.g., roofers, med spa, gym)" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
              <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <TextField label="Offer (what are we promoting?)" value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} />
              <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <TextField label="Your email or Telegram" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <TextField label="Notes" multiline minRows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button disabled={status === "sending"} variant="outlined" onClick={() => submit("starter")}>
                  Pay $99 (5 videos)
                </Button>
                <Button disabled={status === "sending"} variant="contained" onClick={() => submit("standard")}>
                  Pay $199 (10 videos)
                </Button>
                <Button disabled={status === "sending"} variant="outlined" onClick={() => submit("monthly")}>
                  Subscribe $499/mo
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Checkout is Stripe. After payment we’ll confirm delivery via your contact field.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
