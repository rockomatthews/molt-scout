export type Project = {
  slug: string;
  name: string;
  blurb: string;
  status: "active" | "building" | "paused" | "archived";
  category: string;
  tags: string[];
  href?: string; // external link (optional)
};

export const projects: Project[] = [
  {
    slug: "cyber-randy",
    name: "Cyber Randy (private chat)",
    blurb:
      "Founder-controlled private chat room where @cyber_randy only responds when tagged and the user is starred.",
    status: "active",
    category: "Community / Ops",
    tags: ["supabase", "vercel", "trust-gating"],
    href: "https://cyberrandy.com",
  },
  {
    slug: "bot-team-site",
    name: "TheBotTeam.com (public operating system)",
    blurb:
      "Public company site that publishes the queue + meeting transcripts and embeds Mission Control.",
    status: "active",
    category: "Website / Transparency",
    tags: ["nextjs", "markdown", "vercel"],
    href: "https://thebotteam.com",
  },
  {
    slug: "claw-beacon",
    name: "Claw Beacon (Mission Control)",
    blurb:
      "Kanban + live feed. Synced from QUEUE.md and embedded into the main site.",
    status: "active",
    category: "Ops / Dashboard",
    tags: ["railway", "kanban"],
  },
  {
    slug: "agent-ops-toolkit",
    name: "Agent Ops Toolkit (monetization pack)",
    blurb:
      "USDC-on-Base paid toolkit + templates/modules for running agent products reliably.",
    status: "building",
    category: "Product",
    tags: ["usdc", "base", "supabase"],
    href: "https://agenttoolkit.xyz",
  },
  {
    slug: "alpha-engine",
    name: "Alpha Engine (signals + scouts)",
    blurb:
      "Deterministic scouts (Pulse, onchain quotes, cohorts) for alerts-first trading edges.",
    status: "building",
    category: "Crypto / Signals",
    tags: ["base", "pulse", "dex"],
  },
  {
    slug: "zerion-webhook",
    name: "Zerion webhook verifier",
    blurb:
      "Vercel webhook receiver with optional signature verification + parsing.",
    status: "active",
    category: "Infra",
    tags: ["webhooks", "security"],
  },
  {
    slug: "kien-copytrade",
    name: "kien-copytrade (alerts-first)",
    blurb:
      "Watches known wallets for buys/sells on Base. Alerts-first; execution requires explicit go-live.",
    status: "building",
    category: "Crypto / Copytrade",
    tags: ["base", "alerts"],
    href: "https://github.com/rockomatthews/kien-copytrade",
  },
  {
    slug: "polymarket-bot",
    name: "Polymarket scanners (ideas + bot)",
    blurb:
      "Market mispricing scanners and hedged-pair experiments; alerts-first.",
    status: "building",
    category: "Markets",
    tags: ["polymarket", "alerts"],
  },
];
