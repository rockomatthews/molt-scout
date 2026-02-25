"use client";

import Link from "next/link";
import { Container, Stack, Typography, Button, Paper } from "@mui/material";

function HeroImage() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <img
        src="/cyber_randy.png"
        alt="Cyber Randy"
        style={{ width: "50%", height: "auto", maxWidth: 420 }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <HeroImage />
        <Typography variant="h3" fontWeight={800} align="center">
          Cyber Randy
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Private Bot Team chat room. You must register. The bot only speaks when tagged as{" "}
          <b>@cyber_randy</b>. Only users you star are considered trusted.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Typography variant="overline" sx={{ opacity: 0.7 }}>
            Get started
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
            <Button component={Link} href="/register" variant="contained">
              Register
            </Button>
            <Button component={Link} href="/login" variant="outlined">
              Login
            </Button>
            <Button component={Link} href="/chat" variant="text">
              Open chat
            </Button>
          </Stack>
          <Typography sx={{ mt: 1.5, opacity: 0.75 }} variant="body2">
            Deploy on Vercel, add Supabase integration, set an access password, then invite users.
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}
