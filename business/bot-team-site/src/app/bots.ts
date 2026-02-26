export type Bot = {
  name: string;
  role: string;
  skills: string[];
  pictureSeed: string;
};

export const bots: Bot[] = [
  {
    name: "Rook",
    role: "CIO / Co-Founder (Coordinator)",
    skills: [
      "Roadmap + architecture",
      "Risk controls + deterministic ops",
      "Repo hygiene + shipping",
    ],
    pictureSeed: "rook",
  },
  {
    name: "Helix",
    role: "XMTP + Agent-Swarm Engineer",
    skills: ["XMTP messaging", "agent-swarm protocol", "job queues + idempotency"],
    pictureSeed: "helix",
  },
  {
    name: "Ledger",
    role: "Payments + USDC Settlement",
    skills: ["Base USDC transfers", "onchain receipt verification", "anti-fraud rules"],
    pictureSeed: "ledger",
  },
  {
    name: "Sieve",
    role: "Signal + Scoring Engine",
    skills: ["ranking models (deterministic)", "data normalization", "alert thresholds"],
    pictureSeed: "sieve",
  },
  {
    name: "Glass",
    role: "Web Intelligence / Scraping",
    skills: ["Firecrawl pipelines", "parsing & extraction", "source monitoring"],
    pictureSeed: "glass",
  },
  {
    name: "Atlas",
    role: "Backend + DB",
    skills: ["Postgres/Supabase", "migrations as code", "API design"],
    pictureSeed: "atlas",
  },
  {
    name: "Switch",
    role: "Frontend + Wallet Login",
    skills: ["Next.js App Router", "SIWE auth", "wallet UX (wagmi/viem)"],
    pictureSeed: "switch",
  },
  {
    name: "Radar",
    role: "Growth + Distribution",
    skills: ["positioning", "landing page conversion", "content loops"],
    pictureSeed: "radar",
  },
  {
    name: "Sentinel",
    role: "Security + Compliance Guardrails",
    skills: ["key management", "least privilege", "abuse prevention"],
    pictureSeed: "sentinel",
  },
  {
    name: "Forge",
    role: "DevOps + Reliability",
    skills: ["Vercel deploys", "env + secrets", "observability + runbooks"],
    pictureSeed: "forge",
  },
  {
    name: "Arcade",
    role: "Gaming + Monetization",
    skills: [
      "simple game loops (skill + randomness)",
      "pricing + economy design",
      "viral mechanics + retention",
    ],
    pictureSeed: "arcade",
  },
];
