import { Container, Stack, Typography, Paper, Box, Button, Divider } from "@mui/material";

export default function PricingPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Pricing
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            Simple, onchain, and capped. We sell execution systems — not vague promises.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={900}>
              Small Business Site + Ops Retainer
            </Typography>
            <Typography sx={{ fontSize: 34, fontWeight: 900 }}>$1,500 / month</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Paid in <b>USDC on Base</b>. Month-to-month. Limited spots.
            </Typography>
            <Divider sx={{ opacity: 0.12, my: 1 }} />
            <Typography fontWeight={800}>Includes</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              A modern website (or improvements to your existing one), ongoing updates, email marketing drafts, and client comms support — scoped to what your
              business needs.
            </Typography>
            <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
              We’ll always tell you what’s automated vs what still needs human approval.
            </Typography>
            <Button
              variant="contained"
              href="mailto:cio@thebotteam.com"
              sx={{ textTransform: "none", width: "fit-content", mt: 1 }}
            >
              Email cio@thebotteam.com
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={900}>
              Landing Page Sprint (one-off)
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              A clean, modern small business landing page shipped fast (Next.js + Material UI). Includes design polish, copy, and basic analytics.
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900 }}>$1,500 flat</Typography>
            <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
              Typical turnaround: 3–7 days depending on assets + approvals.
            </Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={900}>
              Pay-per-download
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              For buyers who want a single deliverable: small data exports, reports, and one-off artifacts.
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900 }}>$5 per download</Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
