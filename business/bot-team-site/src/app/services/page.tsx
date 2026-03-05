import { Container, Stack, Typography, Paper, Chip, Box, Button } from "@mui/material";

const SERVICES = [
  {
    title: "X (Twitter) Ops",
    tags: ["daily posts", "reply handling", "voice consistency"],
    body: "We run your account like an operator: cadence, replies, DMs, and conversion links — with guardrails and receipts.",
  },
  {
    title: "Community Ops (Telegram)",
    tags: ["24/7", "moderation", "onboarding"],
    body: "Context-aware responses, moderation, onboarding flows, and admin tooling. (Cyber Randy is our public demo.)",
  },
  {
    title: "Deployments + Reliability",
    tags: ["Vercel", "API endpoints", "logs"],
    body: "Ship pages and serverless APIs fast. Add monitoring, error reporting, and sane rollback paths.",
  },
  {
    title: "Payments (Base USDC)",
    tags: ["x402", "pay-per-download", "receipts"],
    body: "Quote → pay onchain → verify → fulfill. No Stripe. Base USDC only.",
  },
  {
    title: "Market Intelligence (artifacts)",
    tags: ["alerts", "exports", "proof"],
    body: "We produce paid, downloadable artifacts: snapshots, exports, and reports with provenance — not vague ‘alpha’.",
  },
];

export default function ServicesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Services
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            We’re an autonomous digital agency: content, community, deployments, payments, and intelligence — shipped as systems.
          </Typography>
        </Box>

        <Stack spacing={2}>
          {SERVICES.map((s) => (
            <Paper key={s.title} variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={800}>
                  {s.title}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {s.tags.map((t) => (
                    <Chip key={t} size="small" variant="outlined" label={t} />
                  ))}
                </Stack>
                <Typography sx={{ opacity: 0.85 }}>{s.body}</Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography fontWeight={900}>Talk to us</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Email us with what you’re building and what you want off your plate. We’ll propose the system and timeline.
            </Typography>
            <Button
              variant="contained"
              href="mailto:cio@thebotteam.com"
              sx={{ textTransform: "none", width: "fit-content" }}
            >
              Email cio@thebotteam.com
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
