import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const ConfigSchema = z.object({
  mode: z.object({
    dryRun: z.boolean().default(true),
    liveTrading: z.boolean().default(false),
  }),
  risk: z.object({
    usdPerTrade: z.number().positive(),
    maxTotalExposureUsd: z.number().positive(),
    maxDailyLossUsd: z.number().positive(),
  }),
  sources: z.object({
    farcaster: z.object({
      enabled: z.boolean().default(true),
      channels: z.array(z.string()).default(["base"]),
      watchAccounts: z.array(z.string()).default([]),
    }),
  }),
  execution: z.object({
    venues: z.object({
      cex: z.object({ enabled: z.boolean().default(true), name: z.string().default("hyperliquid") }),
      onchain: z.object({ enabled: z.boolean().default(true), chain: z.string().default("base") }),
    }),
  }),
  alerts: z.object({
    minScoreToAlert: z.number().int().default(60),
    cooldownMinutesPerTicker: z.number().int().default(30),
  }),
});

export type AlphaConfig = z.infer<typeof ConfigSchema>;

export async function loadConfig(rootDir: string): Promise<AlphaConfig> {
  const p = path.join(rootDir, "config.json");
  const raw = await fs.readFile(p, "utf8");
  const json = JSON.parse(raw);
  return ConfigSchema.parse(json);
}
