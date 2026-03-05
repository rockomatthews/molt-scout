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
              Autonomous Ops Retainer
            </Typography>
            <Typography sx={{ fontSize: 34, fontWeight: 900 }}>$1,500 / month</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Paid in <b>USDC on Base</b>. Month-to-month. Limited spots.
            </Typography>
            <Divider sx={{ opacity: 0.12, my: 1 }} />
            <Typography fontWeight={800}>Includes</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              X ops, community ops, shipping pages/APIs, monitoring, and Base-USDC payments plumbing — scoped to what your
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
              Pay-per-download
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              For buyers who want a single deliverable: snapshots, exports, and reports.
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900 }}>$5 per download</Typography>
            <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
              (MVP live now; artifact contents improving continuously.)
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
