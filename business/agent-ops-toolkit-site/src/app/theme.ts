"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7c4dff" },
    secondary: { main: "#00e5ff" },
    background: { default: "#0b0f17", paper: "#0f1624" },
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  shape: { borderRadius: 14 },
});

export default theme;
