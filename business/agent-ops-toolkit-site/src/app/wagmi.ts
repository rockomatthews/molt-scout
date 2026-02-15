import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Minimal config: injected wallets only (MetaMask/Coinbase Extension/etc.).
// We can add WalletConnect later once we have a projectId.
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});
