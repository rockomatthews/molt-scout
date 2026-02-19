import { Button, Container, Stack, Typography } from "@mui/material";

export default async function SuccessPage() {
  return (
    <Container sx={{ py: 10 }}>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Typography variant="h3" fontWeight={900}>
          Subscription started
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          You’re set. If you have AOT tokens, you can unlock downloads at the Token Gate.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button href="/token" variant="contained">
            Token Gate
          </Button>
          <Button href="/" variant="outlined">
            Home
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
