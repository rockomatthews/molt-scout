import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { supabasePublic } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sb = supabasePublic();

  // Site should build even before Supabase exists.
  const topic = sb
    ? await sb
        .from("crp_topics")
        .select("slug,title,description,solved")
        .eq("slug", "cure-cancer")
        .maybeSingle()
    : null;

  const topicRow = topic?.data ?? null;

  return (
    <Container disableGutters>
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "baseline" }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.4 }}>
              Community Research Pool
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.8, mt: 0.25 }}>
              Curing cancer (public deltas)
            </Typography>
          </Box>
          <Chip label="v0 — one baked topic" variant="outlined" sx={{ opacity: 0.8 }} />
        </Stack>

        <Card
          sx={{
            border: "1px solid rgba(34,197,94,0.22)",
            background:
              "radial-gradient(120% 140% at 50% 0%, rgba(34,197,94,0.16) 0%, rgba(0,0,0,0) 60%)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              SOLVED definition (Milestone B)
            </Typography>
            <Typography sx={{ opacity: 0.88, mt: 1, lineHeight: 1.6 }}>
              A clearly identified mechanism + target class that generalizes, with Phase 2 efficacy signals across multiple tumor types,
              plus validated biomarkers for responders.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Status</Typography>

            {!sb ? (
              <Alert severity="info" sx={{ mt: 1.25 }}>
                Supabase env vars are not set yet. That’s okay — the site is deployable before the DB exists. Set
                <code> NEXT_PUBLIC_SUPABASE_URL</code> and <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel when ready.
              </Alert>
            ) : topicRow ? (
              <Alert severity="success" sx={{ mt: 1.25 }}>
                Connected to Supabase. Topic row found: <code>{topicRow.slug}</code>. Solved: <b>{String(topicRow.solved)}</b>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 1.25 }}>
                Connected to Supabase, but topic table/seed not found yet.
              </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
              <Button component={Link} href="/digest" variant="contained" size="large" sx={{ fontWeight: 900 }}>
                View today’s digest
              </Button>

              <Button
                component="a"
                href="https://clawhub.com"
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                size="large"
                sx={{ fontWeight: 900, borderColor: "rgba(34,197,94,0.45)" }}
              >
                Download OpenClaw skill
              </Button>

              <Button component={Link} href="/api/topic" variant="text" size="large" sx={{ fontWeight: 800 }}>
                API: topic
              </Button>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ opacity: 0.85, fontWeight: 700 }}>Install command</Typography>
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.35)",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 13,
                  overflowX: "auto",
                }}
              >
                clawhub install community-research-pool-cure-cancer
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Typography sx={{ opacity: 0.7, fontSize: 13, lineHeight: 1.7 }}>
          Safety: research-only. No medical advice. Every finding must cite sources.
        </Typography>
      </Stack>
    </Container>
  );
}
