"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Samples from "./Samples";
import BoltIcon from "@mui/icons-material/Bolt";
import MovieCreationIcon from "@mui/icons-material/MovieCreation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#0b0f17",
      }}
    >
      {/* Background montage (muted) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.22,
          filter: "saturate(1.1) contrast(1.05)",
          pointerEvents: "none",
        }}
      >
        <video
          src="/samples/site-bg-montage.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* soft gradient on top so text stays readable */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 700px at 20% 10%, rgba(124,255,178,0.14), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(122,167,255,0.12), transparent 55%), rgba(11,15,23,0.75)",
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <BoltIcon color="primary" />
            <Typography fontWeight={800}>Shorts Factory</Typography>
            <Chip size="small" label="48h turnaround" />
          </Stack>
          <Stack direction="row" spacing={1.2}>
            <Button component={Link} href="#pricing" variant="text">
              Pricing
            </Button>
            <Button component={Link} href="/order" variant="contained">
              Start an order
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={7}>
            <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
              10 TikTok/Reels ads
              <br />
              in 48 hours.
            </Typography>
            <Typography sx={{ mt: 2, opacity: 0.85, fontSize: 18 }}>
              You give us: niche + offer + city + website.
              <br />
              We deliver: 10 short videos + captions + posting plan.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
              <Button component={Link} href="/order" size="large" variant="contained" startIcon={<MovieCreationIcon />}
                >
                Start order
              </Button>
              <Button component={Link} href="#samples" size="large" variant="outlined">
                See samples
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap" }}>
              {[
                "Local businesses",
                "Med spas",
                "Roofers",
                "Dentists",
                "Gyms",
                "Solar",
                "Real estate",
              ].map((t) => (
                <Chip key={t} label={t} variant="outlined" />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <CardContent>
                <Typography fontWeight={800} sx={{ mb: 1 }}>
                  What you get
                </Typography>
                <Divider sx={{ mb: 2, opacity: 0.2 }} />

                <Stack spacing={1.2}>
                  {["10 MP4 shorts (9:16)", "10 captions + hooks", "Posting plan (7–14 days)", "Simple intake form"]
                    .map((x) => (
                      <Stack key={x} direction="row" spacing={1} alignItems="center">
                        <TaskAltIcon color="primary" fontSize="small" />
                        <Typography sx={{ opacity: 0.9 }}>{x}</Typography>
                      </Stack>
                    ))}
                </Stack>

                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.25)" }}>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Deliverables are a zipped bundle: <code>videos/</code>, <code>captions.txt</code>, <code>posting_plan.md</code>.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box id="pricing" sx={{ mt: 8 }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
            Pricing
          </Typography>
          <Grid container spacing={2}>
            {[
              { title: "Starter", price: "$99", bullets: ["5 videos", "5 captions", "48h"], cta: "Start" },
              { title: "Standard", price: "$199", bullets: ["10 videos", "10 captions", "48h"], cta: "Most popular", highlight: true },
              { title: "Monthly", price: "$499/mo", bullets: ["30 videos/month", "weekly batch", "priority"], cta: "Subscribe" },
            ].map((p) => (
              <Grid key={p.title} item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: p.highlight ? "rgba(124,255,178,0.10)" : "rgba(255,255,255,0.06)",
                    border: p.highlight ? "1px solid rgba(124,255,178,0.35)" : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography fontWeight={900}>{p.title}</Typography>
                      <Typography fontWeight={900} color={p.highlight ? "primary" : "inherit"}>
                        {p.price}
                      </Typography>
                    </Stack>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {p.bullets.map((b) => (
                        <Typography key={b} sx={{ opacity: 0.9 }}>
                          • {b}
                        </Typography>
                      ))}
                    </Stack>
                    <Button component={Link} href="/order" variant={p.highlight ? "contained" : "outlined"} sx={{ mt: 2 }} fullWidth>
                      {p.cta}
                    </Button>
                    <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 1 }}>
                      USDC on Base support can be added (no Stripe) when ready.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box id="samples" sx={{ mt: 8 }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
            Samples
          </Typography>
          <Typography sx={{ opacity: 0.75, mb: 2 }}>
            This preview was generated by the same kind of pipeline we’ll use for paid orders.
          </Typography>
          <Samples />
        </Box>

        <Box sx={{ mt: 8, opacity: 0.7 }}>
          <Typography variant="caption">
            MVP: intake + deliverables. No automated outreach. No trading.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
