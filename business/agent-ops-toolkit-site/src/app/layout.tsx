import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import WalletProviders from "./wallet-providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://agenttoolkit.xyz"),
  title: {
    default: "Agent Ops Toolkit",
    template: "%s — Agent Ops Toolkit",
  },
  description:
    "Production-grade webhooks, retries, queues, budgets, and observability templates for OpenClaw/Molt agent builders.",
  openGraph: {
    type: "website",
    url: "https://agenttoolkit.xyz",
    siteName: "Agent Ops Toolkit",
    title: "Agent Ops Toolkit",
    description:
      "Run OpenClaw agents like production software. Webhook-native reliability + spend caps + observability.",
    images: [
      {
        url: "/brand/og-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Agent Ops Toolkit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Ops Toolkit",
    description:
      "Webhook-native reliability + spend caps + observability for OpenClaw/Molt agents.",
    images: ["/brand/og-1200x630.jpg"],
  },
  icons: {
    icon: [{ url: "/brand/favicon-64.png" }],
    apple: [{ url: "/brand/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <WalletProviders>{children}</WalletProviders>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
