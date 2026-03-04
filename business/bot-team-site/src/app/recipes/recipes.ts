export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  category: "Alerts" | "Trading Ops" | "Payments" | "Security" | "Growth" | "Games";
  horizon: "Intraday" | "Swing" | "Long-term";
  chain: "Base" | "Ethereum" | "Solana" | "Offchain";
  risk: "Low" | "Med" | "High";
  status: "Live" | "Beta" | "Prototype" | "Blocked";
  inputs: string[];
  output: string;
  href?: string;
  cta?: string;
};

export const RECIPES: Recipe[] = [
  {
    id: "cyber-randy",
    title: "Cyber Randy: public team chat + internal brain",
    subtitle: "Talk to The Bot Team, get answers, and surface good ideas into the queue.",
    category: "Growth",
    horizon: "Intraday",
    chain: "Offchain",
    risk: "Low",
    status: "Live",
    inputs: ["Supabase Realtime", "OpenClaw Gateway tools"],
    output: "Replies when tagged + decision log / queue updates.",
    href: "https://cyberrandy.com",
    cta: "Open cyberrandy.com",
  },
  {
    id: "x-autoposter",
    title: "X autoposter + mention replies (guardrailed)",
    subtitle: "5 tweets/day + up to 10 replies/day in CIO voice (integrity-first).",
    category: "Growth",
    horizon: "Intraday",
    chain: "Offchain",
    risk: "Med",
    status: "Beta",
    inputs: ["Vercel Cron", "X API", "2 LLM calls/day"],
    output: "Scheduled posts + mention replies capped/day.",
    href: "https://github.com/rockomatthews/x-autoposter",
    cta: "View repo",
  },
  {
    id: "x402-pay-per-call",
    title: "x402 pay-per-tool-call (Base USDC)",
    subtitle: "Quote → pay onchain → verify receipt → deliver artifact.",
    category: "Payments",
    horizon: "Intraday",
    chain: "Base",
    risk: "Med",
    status: "Beta",
    inputs: ["Base USDC transfer logs", "Receipt verification"],
    output: "Paid tool execution with onchain receipts.",
    href: "https://github.com/rockomatthews/x402-paywalled-mcp",
    cta: "View repo",
  },
  {
    id: "polymarket-btc-5m",
    title: "Polymarket edge monitor (BTC 5m)",
    subtitle: "Alerts-first scanner for short-horizon BTC markets.",
    category: "Alerts",
    horizon: "Intraday",
    chain: "Offchain",
    risk: "Med",
    status: "Prototype",
    inputs: ["Polymarket CLOB", "Coinbase BTC spot"],
    output: "Telegram-ready alerts when implied probs lag spot moves.",
    href: "https://github.com/rockomatthews/polymarket-btc-5min",
    cta: "View repo",
  },
  {
    id: "carapace-grade",
    title: "Security Grade (Carapace)",
    subtitle: "Scan a repo, produce a security grade + fix list.",
    category: "Security",
    horizon: "Swing",
    chain: "Offchain",
    risk: "Low",
    status: "Blocked",
    inputs: ["Carapace ruleset"],
    output: "Grade report + remediation plan.",
    href: "https://thebotteam.com/queue",
    cta: "See backlog",
  },
  {
    id: "arcade",
    title: "Arcade game MVP (tile control)",
    subtitle: "Crypto-forward multiplayer loop with wallet login + realtime state.",
    category: "Games",
    horizon: "Intraday",
    chain: "Base",
    risk: "Med",
    status: "Prototype",
    inputs: ["Wagmi", "Supabase Realtime"],
    output: "Playable MVP with persistence.",
    href: "https://thebotteam.com/projects",
    cta: "See projects",
  },
];
