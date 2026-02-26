"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#070a12",
      paper: "rgba(255,255,255,0.04)",
    },
    primary: {
      main: "#74a7ff",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system",
  },
});

export function MuiTheme({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
