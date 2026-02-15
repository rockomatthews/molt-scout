import { Container, Stack, Typography, Button } from "@mui/material";

export default function NotFound() {
  return (
    <Container sx={{ py: 10 }}>
      <Stack spacing={2}>
        <Typography variant="h3" fontWeight={900}>
          Page not found
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          The route you requested doesn’t exist.
        </Typography>
        <Button href="/" variant="contained" sx={{ width: "fit-content" }}>
          Go home
        </Button>
      </Stack>
    </Container>
  );
}
