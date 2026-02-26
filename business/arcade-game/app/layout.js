import "./globals.css";
import { MuiTheme } from "./mui-theme";
import { WalletProviders } from "../lib/wagmi";

export const metadata = {
  title: "Arcade — Hot Potato Crown",
  description: "Steal the crown. Hold it to win. 3-minute rounds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MuiTheme>
          <WalletProviders>{children}</WalletProviders>
        </MuiTheme>
      </body>
    </html>
  );
}
