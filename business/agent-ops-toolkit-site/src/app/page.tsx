import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ReviewsWidget from "./reviews-widget";
import RadarTicker from "./components/RadarTicker";

const tiers = [
  {
    name: "Starter",
    price: "$99",
    cadence: "one-time",
    bullets: [
      "Webhook receiver template (signatures + idempotency)",
      "Queue + retry + dead-letter pattern",
      "Structured logging + trace ids",
      "Runbooks + checklists",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/mo",
    bullets: [
      "Everything in Starter",
      "Updates + new templates",
      "Budget guards (per-day/per-job caps)",
      "Telegram alert routing templates",
    ],
  },
  {
    name: "Teams",
    price: "$199+",
    cadence: "/mo",
    bullets: [
      "Everything in Pro",
      "Priority support",
      "SLA + incident response playbooks",
      "Customization (integrations, dashboards)",
    ],
  },
];

function ReviewsBlock() {
  return (
    <Box sx={{ maxWidth: 1100 }}>
      <ReviewsWidget />
    </Box>
  );
}

export default function Page() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          backdropFilter: "blur(10px)",
          background: "rgba(11,15,23,0.7)",
          zIndex: 10,
        }}
      >
        <Container sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.25} alignItems="center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/header-logo.png" alt="Agent Toolkit" width={72} height={72} style={{ display: "block" }} />
              <Typography fontWeight={900}>Agent Toolkit</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
              <Button href="/waitlist" variant="text" color="inherit">
                Waitlist
              </Button>
              <Button href="/products/revenue-ops" variant="text" color="inherit">
                Products
              </Button>
              <Button href="#buy" variant="contained">
                Subscribe
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: "flex", sm: "none" } }}>
              <Button href="/waitlist" variant="outlined" size="small">
                Waitlist
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <RadarTicker />

      <Container sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Stack spacing={2} sx={{ maxWidth: 900 }}>
            <Typography variant="h2" fontWeight={900}>
              Agents that don’t miss events.
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.85 }}>
              Production-grade webhooks, retries, queues, budgets, and observability templates for Molt/OpenClaw builders.
              Keep your agent reliable — and keep your spend capped.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2, width: "fit-content" }} id="buy">
              <Button size="large" variant="contained" href="/subscribe" fullWidth>
                Subscribe / Buy
              </Button>
              <Button size="large" variant="outlined" href="#features" fullWidth>
                See what’s inside
              </Button>
            </Stack>
            <Typography sx={{ opacity: 0.7, pt: 1 }}>
              Built for OpenClaw / Molt builders. Webhook-native. Deterministic-first. Cost-aware.
            </Typography>
          </Stack>

          {/* Above-the-fold reviews */}
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <ReviewsBlock />
        </Stack>

        <Divider sx={{ my: 6 }} />

        <Box id="features">
          <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            What you get
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                title: "Webhook reliability",
                body: "Signature verification, timestamp tolerance, raw-body capture, idempotency keys, replay endpoints.",
              },
              {
                title: "Durable work queue",
                body: "Exponential backoff retries, max attempts, dead-letter queue, alerting on poison messages.",
              },
              {
                title: "Budget guards",
                body: "Per-task/per-day spend caps, circuit breakers, and alerting when your agent is spiraling.",
              },
              {
                title: "Observability",
                body: "Structured JSON logs, trace ids, correlation across webhooks → jobs → LLM calls.",
              },
            ].map((f) => (
              <Grid key={f.title} size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight={800}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.8, mt: 1 }}>{f.body}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        <Box id="pricing">
          <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            Pricing
          </Typography>
          <Grid container spacing={2}>
            {tiers.map((t) => (
              <Grid key={t.name} size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={900}>
                        {t.name}
                      </Typography>
                      <Typography variant="h4" fontWeight={900}>
                        {t.price}
                        <Typography component="span" sx={{ opacity: 0.7, ml: 1 }}>
                          {t.cadence}
                        </Typography>
                      </Typography>
                      <Stack sx={{ pt: 1 }} spacing={0.5}>
                        {t.bullets.map((b) => (
                          <Typography key={b} sx={{ opacity: 0.85 }}>
                            • {b}
                          </Typography>
                        ))}
                      </Stack>
                      <Button sx={{ mt: 2 }} variant={t.name === "Pro" ? "contained" : "outlined"} href="/subscribe">
                        Choose {t.name}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography sx={{ opacity: 0.65, mt: 2 }}>
            Payments/subscriptions will run via Stripe Checkout once connected.
          </Typography>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", py: 4 }}>
        <Container>
          <Typography sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Agent Ops Toolkit. Built to make agents boringly reliable.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
