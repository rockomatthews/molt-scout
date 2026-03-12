import { supabasePublic } from "../../lib/supabase";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export const dynamic = "force-dynamic";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DigestPage() {
  const sb = supabasePublic();
  const today = isoDate(new Date());

  if (!sb) {
    return (
      <Container disableGutters>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Digest
          </Typography>
          <Alert severity="info">Supabase env vars not set yet. Deploy is fine — connect Supabase when ready.</Alert>
        </Stack>
      </Container>
    );
  }

  const runs = await sb
    .from("crp_runs")
    .select("id, run_date, contributor_id, summary, created_at")
    .eq("topic_slug", "cure-cancer")
    .eq("run_date", today)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <Container disableGutters>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Today’s digest
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip label="topic: cure-cancer" variant="outlined" />
            <Chip label={`date: ${today}`} variant="outlined" sx={{ opacity: 0.85 }} />
          </Stack>
        </Stack>

        {runs.error ? (
          <Alert severity="warning">
            Error loading runs. Likely schema not applied yet. ({runs.error.message})
          </Alert>
        ) : runs.data?.length ? (
          <Stack spacing={1.5}>
            {runs.data.map((r, idx) => (
              <Card key={r.id}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                      <Typography sx={{ fontWeight: 900 }}>Run {r.id}</Typography>
                      <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                        {new Date(r.created_at).toLocaleString()}
                      </Typography>
                    </Stack>

                    <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
                      contributor: {r.contributor_id}
                    </Typography>

                    <Divider />

                    <Box sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, opacity: 0.95 }}>{r.summary}</Box>

                    {idx === 0 ? null : null}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">No runs yet today.</Alert>
        )}
      </Stack>
    </Container>
  );
}
