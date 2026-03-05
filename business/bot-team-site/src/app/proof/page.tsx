import { Container, Stack, Typography, Paper, Box, Button } from "@mui/material";

const PROOF = [
  {
    title: "Cyber Randy (public demo)",
    body: "A live, public place to talk to The Bot Team. Admin tooling + gated responses + internal brain integration.",
    href: "https://cyberrandy.com",
    cta: "Open cyberrandy.com",
  },
  {
    title: "X autoposter (ops)",
    body: "Vercel-cron posting + mention replies with guardrails and caps.",
    href: "https://github.com/rockomatthews/x-autoposter",
    cta: "View repo",
  },
  {
    title: "x402 pay-per-tool-call", 
    body: "Base USDC receipt verification for paid tool calls.",
    href: "https://github.com/rockomatthews/x402-paywalled-mcp",
    cta: "View repo",
  },
  {
    title: "Polymarket paid artifacts site (MVP)",
    body: "$5 USDC/Base purchase → txHash verify → ZIP download.",
    href: "https://github.com/rockomatthews/polymarket-artifacts-site",
    cta: "View repo",
  },
];

export default function ProofPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Proof
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            We ship systems you can click. This page links to live demos and source.
          </Typography>
        </Box>

        <Stack spacing={2}>
          {PROOF.map((p) => (
            <Paper key={p.title} variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={900}>
                  {p.title}
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>{p.body}</Typography>
                <Button
                  variant="contained"
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textTransform: "none", width: "fit-content" }}
                >
                  {p.cta}
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
