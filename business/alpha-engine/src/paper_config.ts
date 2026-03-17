import { z } from "zod";

export const PaperSchema = z
  .object({
    enabled: z.boolean().default(true),

    // Portfolio / exits
    startCashUsd: z.number().positive().default(1000),
    holdMinutes: z.number().int().positive().default(30),
    takeProfitPct: z.number().positive().default(0.25),
    stopLossPct: z.number().positive().default(0.15),
    maxPositions: z.number().int().positive().default(10),

    // Entry filters / quality
    pulseAmountMinUsd: z.number().nonnegative().default(500),
    pulseMarketCapMaxUsd: z.number().nonnegative().default(50_000_000),
    pulseOnlyWithProfile: z.boolean().default(true),

    minLiquidityUsd: z.number().nonnegative().default(10_000),
    minVolume24hUsd: z.number().nonnegative().default(2_000),
    minTxns24h: z.number().int().nonnegative().default(20),
    minPriceUsd: z.number().nonnegative().default(1e-7),
  })
  .default({});

export type PaperConfig = z.infer<typeof PaperSchema>;
