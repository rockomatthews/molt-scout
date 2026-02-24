"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#070a12", paper: "rgba(255,255,255,0.03)" },
    primary: { main: "#74a7ff" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system",
  },
});

export function MuiTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
