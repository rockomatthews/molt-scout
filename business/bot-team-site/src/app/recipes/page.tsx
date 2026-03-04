"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { RECIPES, type Recipe } from "./recipes";

const categories = ["All", "Alerts", "Trading Ops", "Payments", "Security", "Growth", "Games"] as const;
const horizons = ["All", "Intraday", "Swing", "Long-term"] as const;
const chains = ["All", "Base", "Ethereum", "Solana", "Offchain"] as const;
const risks = ["All", "Low", "Med", "High"] as const;
const statuses = ["All", "Live", "Beta", "Prototype", "Blocked"] as const;

function matches<T extends string>(value: T, selected: string) {
  return selected === "All" || value === selected;
}

function RecipeCard({ r }: { r: Recipe }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
      <Stack spacing={1}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {r.title}
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>{r.subtitle}</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ pt: { xs: 0, sm: 0.5 } }}>
            <Chip size="small" label={r.status} />
            <Chip size="small" variant="outlined" label={r.category} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" variant="outlined" label={`Horizon: ${r.horizon}`} />
          <Chip size="small" variant="outlined" label={`Chain: ${r.chain}`} />
          <Chip size="small" variant="outlined" label={`Risk: ${r.risk}`} />
        </Stack>

        <Divider sx={{ opacity: 0.12 }} />

        <Stack spacing={0.8}>
          <Typography fontWeight={700}>Inputs</Typography>
          <Typography sx={{ opacity: 0.85 }}>{r.inputs.join(" · ")}</Typography>
          <Typography fontWeight={700} sx={{ pt: 0.6 }}>
            Output
          </Typography>
          <Typography sx={{ opacity: 0.85 }}>{r.output}</Typography>
        </Stack>

        {r.href ? (
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              href={r.href}
              target="_blank"
              rel="noreferrer"
              sx={{ textTransform: "none" }}
            >
              {r.cta || "Open"}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

export default function RecipesPage() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [hor, setHor] = useState<(typeof horizons)[number]>("All");
  const [chain, setChain] = useState<(typeof chains)[number]>("All");
  const [risk, setRisk] = useState<(typeof risks)[number]>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");

  const filtered = useMemo(() => {
    return RECIPES.filter((r) => {
      return (
        (cat === "All" || r.category === cat) &&
        matches(r.horizon, hor) &&
        matches(r.chain, chain) &&
        matches(r.risk, risk) &&
        matches(r.status, status)
      );
    });
  }, [cat, hor, chain, risk, status]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Recipe Lab
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            Playbooks, pipelines, and products — structured like recipes. (Structure inspired by strategy browsers; content is ours.)
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography fontWeight={800} sx={{ mb: 0.8 }}>
                Filters
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {categories.map((x) => (
                    <Chip key={x} label={x} color={x === cat ? "primary" : "default"} onClick={() => setCat(x)} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {horizons.map((x) => (
                    <Chip key={x} label={x} color={x === hor ? "primary" : "default"} onClick={() => setHor(x)} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {chains.map((x) => (
                    <Chip key={x} label={x} color={x === chain ? "primary" : "default"} onClick={() => setChain(x)} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {risks.map((x) => (
                    <Chip key={x} label={x} color={x === risk ? "primary" : "default"} onClick={() => setRisk(x)} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {statuses.map((x) => (
                    <Chip key={x} label={x} color={x === status ? "primary" : "default"} onClick={() => setStatus(x)} />
                  ))}
                </Stack>
              </Stack>
            </Box>

            <Typography sx={{ opacity: 0.8 }}>
              Showing <b>{filtered.length}</b> of <b>{RECIPES.length}</b>
            </Typography>
          </Stack>
        </Paper>

        <Stack spacing={2}>
          {filtered.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
