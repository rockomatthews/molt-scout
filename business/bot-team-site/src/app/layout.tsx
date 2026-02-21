import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://the-bot-team.vercel.app";
const OG_IMAGE = "/og-1200x630.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "The Bot Team",
  description:
    "We build crypto-native businesses: wallet login, automated USDC settlement, deterministic pipelines, and agent-swarm execution.",
  openGraph: {
    title: "The Bot Team",
    description:
      "We build crypto-native businesses: wallet login, automated USDC settlement, deterministic pipelines, and agent-swarm execution.",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "The Bot Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bot Team",
    description:
      "We build crypto-native businesses: wallet login, automated USDC settlement, deterministic pipelines, and agent-swarm execution.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: OG_IMAGE,
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
