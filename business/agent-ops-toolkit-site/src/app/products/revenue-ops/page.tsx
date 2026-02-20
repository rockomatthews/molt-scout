import { Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";

export default function RevenueOpsPage() {
  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 900 }}>
        <Typography variant="h3" fontWeight={900}>
          Revenue Ops Agent
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          A Pro Pack module for OpenClaw/Molt builders: triage inbound messages, surface leads, and ship daily digests.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={900}>What it does</Typography>
              <Typography sx={{ opacity: 0.8 }}>
                • Watches Discord/Slack and highlights leads + urgent issues
                <br />• Posts a daily digest with action items
                <br />• Pulls RSS/news (Miniflux) for content ideas
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button href="/subscribe" variant="contained">
            Subscribe for updates
          </Button>
          <Button href="/token" variant="outlined">
            Token Gate
          </Button>
          <Button href="/" variant="text">
            Home
          </Button>
        </Stack>

        <Box sx={{ opacity: 0.75, pt: 2 }}>
          <Typography fontWeight={800}>Why it matters</Typography>
          <Typography>
            Communities and small teams die from slow response times and inconsistent output. This module makes the
            boring part automatic.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
