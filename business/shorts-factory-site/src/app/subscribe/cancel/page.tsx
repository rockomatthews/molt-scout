"use client";

import Link from "next/link";
import { Box, Button, Container, Typography, Card, CardContent } from "@mui/material";

export default function CancelPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
              Checkout canceled
            </Typography>
            <Typography sx={{ opacity: 0.8, mb: 3 }}>
              No worries — you can restart checkout anytime.
            </Typography>
            <Button component={Link} href="/order" variant="contained">
              Back to order
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
