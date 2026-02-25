import type { Metadata } from "next";
import "./globals.css";
import { MuiTheme } from "./mui-theme";

export const metadata: Metadata = {
  title: "Cyber Randy — Bot Team Chat",
  description:
    "Private Bot Team chat room. The bot only speaks when tagged as @cyber_randy. Only starred users are trusted.",
  applicationName: "Cyber Randy",
  metadataBase: new URL("https://cyber-randy.vercel.app"),
  openGraph: {
    title: "Cyber Randy — Bot Team Chat",
    description:
      "Private Bot Team chat room. The bot only speaks when tagged as @cyber_randy. Only starred users are trusted.",
    type: "website",
    images: [
      {
        url: "/cyber_randy.png",
        width: 1200,
        height: 630,
        alt: "Cyber Randy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber Randy — Bot Team Chat",
    description:
      "Private Bot Team chat room. The bot only speaks when tagged as @cyber_randy. Only starred users are trusted.",
    images: ["/cyber_randy.png"],
  },
  icons: {
    icon: "/cyber_randy_chat_icon.png",
    apple: "/cyber_randy_chat_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MuiTheme>{children}</MuiTheme>
      </body>
    </html>
  );
}
