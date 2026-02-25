import { redirect } from "next/navigation";
import { Container, Stack, Typography, Paper } from "@mui/material";
import { createClient } from "../../supabase/server";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code : undefined;

  if (!code) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography variant="h6">Missing code</Typography>
            <Typography sx={{ opacity: 0.8 }}>
              This link is missing the auth code. Try logging in again.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, bgcolor: "rgba(255,255,255,0.03)" }}>
          <Stack spacing={1}>
            <Typography variant="h6">Auth failed</Typography>
            <Typography sx={{ opacity: 0.8 }}>{error.message}</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  redirect("/chat");
}
