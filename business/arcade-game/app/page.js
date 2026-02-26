"use client";

import Link from "next/link";

import { Shell, Topbar, Card, Box, Button, Chip, Stack, Typography } from "./ui";

export default function Home() {
  return (
    <Shell>
      <Topbar
        left={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <img
              src="/hot-potato-logo.png"
              alt="Hot Potato Crown"
              style={{ width: 72, height: 72, borderRadius: 18, objectFit: "cover" }}
            />
            <Box>
              <Chip label="ARCADE · MVP" size="small" />
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, lineHeight: 1.05 }}>
                Hot Potato Crown
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Steal the crown. Hold it. Win.
              </Typography>
            </Box>
          </Stack>
        }
        right={<Typography variant="body2" sx={{ opacity: 0.7 }}>Bot Team / Gaming</Typography>}
      />

      <Typography sx={{ opacity: 0.85, mb: 2 }}>
        A fast tile-control game: steal the Crown tile, hold it, and win the round. Skill + randomness,
        3-minute rounds, public leaderboard.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Card
          title="How it works"
          subtitle="Simple, legible loop"
          sx={{ flex: 1 }}
        >
          <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.7 }}>
            • 10×10 grid (100 tiles)
            <br />• One tile is the Crown
            <br />• Capture the Crown → become the holder
            <br />• Hold it to earn points until the round ends
          </Typography>
        </Card>

        <Card
          title="Play"
          subtitle="Free MVP now; paid rounds after it’s fun"
          sx={{ flex: 1 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 0.5 }}>
            <Button component={Link} href="/play" variant="contained">
              Enter arena
            </Button>
            <Button
              component="a"
              href="https://takeover.fun"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              Inspiration ↗
            </Button>
          </Stack>
        </Card>
      </Stack>

      <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.6 }}>
        Dev note: Connect Supabase in Vercel for multiplayer + persistence.
      </Typography>
    </Shell>
  );
}
