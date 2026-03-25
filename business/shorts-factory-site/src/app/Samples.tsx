"use client";

import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function Samples() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Gym promo (voice)
            </Typography>
            <Box
              component="video"
              src="/samples/gym-voice-preview.mp4"
              controls
              playsInline
              sx={{ width: "100%", borderRadius: 2, border: "1px solid rgba(255,255,255,0.10)" }}
            />
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
              Rendered with our current MVP pipeline (TTS voiceover + programmatic 9:16 render).
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              What will improve next
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Next: branded templates, kinetic typography, b-roll overlays, and consistent style packs.
              The render worker will generate these automatically after Stripe payment.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
