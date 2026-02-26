"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export function Shell({ children }) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 } }}>
      {children}
    </Container>
  );
}

export function Topbar({ left, right }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
      <Box sx={{ minWidth: 0 }}>{left}</Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>{right}</Box>
    </Box>
  );
}

export function Card({ title, subtitle, children, sx }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)", ...sx }}>
      {title ? (
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
      {children}
    </Paper>
  );
}

export { Box, Button, Chip, Stack, TextField, Typography };
