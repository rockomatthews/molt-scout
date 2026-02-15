import { Box, Button, Container, Stack, Typography } from "@mui/material";

export default function SubscribePage() {
  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Typography variant="h3" fontWeight={900}>
          Subscribe / Buy
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Next step is wiring Stripe Checkout + webhooks (so access is granted automatically after payment).
        </Typography>

        <Box sx={{ p: 3, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
          <Stack spacing={1.5}>
            <Typography fontWeight={800}>For now</Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Tell me which tier you want (Starter / Pro / Teams) and I’ll connect Stripe + Vercel env vars.
            </Typography>
            <Button href="/" variant="outlined">
              Back
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
