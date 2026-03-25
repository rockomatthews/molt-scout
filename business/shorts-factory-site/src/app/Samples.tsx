"use client";

import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

type Sample = {
  title: string;
  src: string;
  note?: string;
};

const SAMPLES: Sample[] = [
  {
    title: "Gym promo (voice)",
    src: "/samples/gym-voice-preview.mp4",
  },
  {
    title: "Roofing promo (voice)",
    src: "/samples/roofing-voice-preview.mp4",
  },
  {
    title: "Dental promo (voice)",
    src: "/samples/dental-voice-preview.mp4",
  },
  {
    title: "Med spa promo (voice)",
    src: "/samples/medspa-voice-preview.mp4",
  },
];

export default function Samples() {
  return (
    <Grid container spacing={2}>
      {SAMPLES.map((s) => (
        <Grid key={s.src} item xs={12} md={6}>
          <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <CardContent>
              <Typography fontWeight={800} sx={{ mb: 1 }}>
                {s.title}
              </Typography>
              <Box
                component="video"
                src={s.src}
                controls
                playsInline
                preload="metadata"
                sx={{ width: "100%", borderRadius: 2, border: "1px solid rgba(255,255,255,0.10)" }}
              />
              <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
                Rendered with our current MVP pipeline (TTS voiceover + programmatic 9:16 render).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <CardContent>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Next upgrades
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
