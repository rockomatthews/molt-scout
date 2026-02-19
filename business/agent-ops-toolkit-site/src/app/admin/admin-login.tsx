"use client";

import * as React from "react";
import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

export default function AdminLogin({ nextPath }: { nextPath: string }) {
  const [key, setKey] = React.useState("");

  function go() {
    const url = new URL(window.location.href);
    url.pathname = nextPath;
    url.searchParams.set("key", key);
    window.location.href = url.toString();
  }

  return (
    <Container sx={{ py: 10 }}>
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Typography variant="h4" fontWeight={900}>
          Admin login
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Enter the admin password to view this page.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <TextField
                label="Admin password"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go();
                }}
              />
              <Box>
                <Button variant="contained" onClick={go}>
                  Continue
                </Button>
              </Box>
              <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                Tip: you can bookmark the URL after you’re in.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
