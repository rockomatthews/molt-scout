"use client";

import Link from "next/link";
import { Box, Button, Container, Typography, Card, CardContent } from "@mui/material";

export default function SuccessPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
              Payment received
            </Typography>
            <Typography sx={{ opacity: 0.8, mb: 3 }}>
              You’re in. Reply with any extra notes and we’ll start production.
            </Typography>
            <Button component={Link} href="/" variant="contained">
              Back home
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
