import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  created_at: string;
  status: string;
  payer_wallet: string;
  receiver_wallet: string;
  usdc_amount: number;
  usdc_tx_hash: string;
  aot_amount?: number | null;
  aot_tx_hash?: string | null;
  error?: string | null;
};

async function fetchRows(): Promise<Row[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("otc_requests")
    .select(
      "id, created_at, status, payer_wallet, receiver_wallet, usdc_amount, usdc_tx_hash, aot_amount, aot_tx_hash, error",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as any;
}

function short(s: string, n = 6) {
  if (!s) return "";
  if (s.length <= n * 2) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export default async function AdminOtcPage() {
  const rows = await fetchRows();
  const pending = rows.filter((r) => r.status === "pending");
  const fulfilled = rows.filter((r) => r.status === "fulfilled");
  const errored = rows.filter((r) => r.status === "error");

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Admin: OTC Requests
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>
              Read-only view. If this page is public, rotate keys and add auth.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button href="/otc" variant="outlined">
              OTC page
            </Button>
            <Button href="/token" variant="outlined">
              Token gate
            </Button>
          </Stack>
        </Stack>

        <Typography sx={{ opacity: 0.8 }}>
          Pending: {pending.length} · Fulfilled: {fulfilled.length} · Error: {errored.length} · Total shown: {rows.length}
        </Typography>

        {!rows.length ? (
          <Card variant="outlined">
            <CardContent>
              <Typography sx={{ opacity: 0.8 }}>
                No rows found, or Supabase env vars not configured in Vercel.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((r) => (
              <Card key={r.id} variant="outlined">
                <CardContent>
                  <Stack spacing={0.75}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Typography fontWeight={900}>
                        {r.status.toUpperCase()} · {new Date(r.created_at).toLocaleString()}
                      </Typography>
                      <Typography sx={{ opacity: 0.75, fontFamily: "monospace" }}>{short(r.id, 8)}</Typography>
                    </Stack>

                    <Typography sx={{ opacity: 0.85 }}>
                      USDC: <b>{Number(r.usdc_amount).toFixed(2)}</b>
                    </Typography>

                    <Typography sx={{ opacity: 0.75, fontFamily: "monospace" }}>
                      payer: {r.payer_wallet}
                    </Typography>
                    <Typography sx={{ opacity: 0.75, fontFamily: "monospace" }}>
                      receiver: {r.receiver_wallet}
                    </Typography>

                    <Typography sx={{ opacity: 0.75, fontFamily: "monospace" }}>
                      usdc tx: {r.usdc_tx_hash}
                    </Typography>

                    {r.aot_tx_hash && (
                      <Typography sx={{ opacity: 0.75, fontFamily: "monospace" }}>
                        aot tx: {r.aot_tx_hash}
                      </Typography>
                    )}

                    {r.error && (
                      <Typography sx={{ opacity: 0.75 }}>
                        error: <span style={{ fontFamily: "monospace" }}>{r.error}</span>
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Typography sx={{ opacity: 0.7, pt: 2 }}>
          Next improvement: add password auth (so the service role key is never reachable publicly).
        </Typography>
      </Stack>
    </Container>
  );
}
