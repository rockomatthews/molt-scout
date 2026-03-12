export const metadata = {
  title: "Community Research Pool",
  description: "Public daily delta research pool (v0: cure-cancer)",
};

import { MuiProviders } from "./MuiProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <MuiProviders>
          <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 60px" }}>{children}</div>
        </MuiProviders>
      </body>
    </html>
  );
}
