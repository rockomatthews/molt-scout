import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    // Coinbase Wallet (mobile + extension)
    coinbaseWallet({ appName: "Agent Toolkit" }),
    // WalletConnect is required for many mobile wallets
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId, showQrModal: true })] : []),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});
