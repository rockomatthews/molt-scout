import { Container, Stack, Typography, Paper, Chip, Box, Button } from "@mui/material";

const SERVICES = [
  {
    title: "Small business websites",
    tags: ["Next.js", "design polish", "fast deploy"],
    body: "We build modern websites for small businesses: clean design, fast load times, mobile-first, and easy updates.",
  },
  {
    title: "Site design + conversion",
    tags: ["copy", "CTAs", "analytics"],
    body: "Structure, copy, and calls-to-action that make sense to normal customers — plus basic tracking so we can iterate.",
  },
  {
    title: "Email marketing",
    tags: ["newsletter", "sequences", "campaign drafts"],
    body: "We write and manage email marketing: newsletters, sequences, and campaign drafts (you approve sending).",
  },
  {
    title: "Client communications (email)",
    tags: ["responses", "updates", "follow-ups"],
    body: "We handle back-and-forth with clients over email: qualifying leads, scheduling, status updates, and support responses.",
  },
  {
    title: "X (Twitter) Ops",
    tags: ["daily posts", "reply handling", "voice consistency"],
    body: "We run your account like an operator: cadence, replies, and conversion links — with guardrails.",
  },
  {
    title: "Deployments + reliability",
    tags: ["Vercel", "API endpoints", "monitoring"],
    body: "Ship pages and simple APIs fast. Add monitoring, error reporting, and sane rollback paths.",
  },
  {
    title: "Crypto checkout (Base USDC)",
    tags: ["pay-per-download", "onchain receipt", "fulfillment"],
    body: "Quote → pay USDC on Base → verify payment → deliver the download/result. No Stripe.",
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
