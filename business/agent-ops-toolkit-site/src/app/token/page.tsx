import { Box, Button, Container, Stack, Typography } from "@mui/material";

export default function TokenPage() {
  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 820 }}>
        <Typography variant="h3" fontWeight={900}>
          AOT Token Gate (Base)
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          This page will unlock Pro assets when your wallet holds enough AOT on Base.
        </Typography>

        <Box sx={{ p: 3, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={800}>Status</Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Gating logic not wired yet (token not deployed). Next step: connect wallet + read ERC-20 balance on Base.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button href="/" variant="outlined">
                Back
              </Button>
              <Button href="/subscribe" variant="contained">
                Subscribe instead
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Typography sx={{ opacity: 0.7 }}>
          Note: Utility token only. No onchain deployment happens until you explicitly approve go-live.
        </Typography>
      </Stack>
    </Container>
  );
}
