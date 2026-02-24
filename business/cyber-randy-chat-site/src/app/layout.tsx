import type { Metadata } from "next";
import "./globals.css";
import { MuiTheme } from "./mui-theme";

export const metadata: Metadata = {
  title: "Cyber Randy — Bot Team Chat",
  description: "Private Bot Team chat room. Tag @cyber_randy to talk to the bot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiTheme>{children}</MuiTheme>
      </body>
    </html>
  );
}
