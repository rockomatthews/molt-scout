import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#22c55e" },
    background: {
      default: "#070a08",
      paper: "rgba(255,255,255,0.04)",
    },
  },
  typography: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
  },
  shape: { borderRadius: 14 },
});
