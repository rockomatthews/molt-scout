import { z } from "zod";

export const PaperSchema = z
  .object({
    enabled: z.boolean().default(true),
    startCashUsd: z.number().positive().default(1000),
    holdMinutes: z.number().int().positive().default(30),
    takeProfitPct: z.number().positive().default(0.25),
    stopLossPct: z.number().positive().default(0.15),
    maxPositions: z.number().int().positive().default(10),
    minLiquidityUsd: z.number().nonnegative().default(10_000),
  })
  .default({});

export type PaperConfig = z.infer<typeof PaperSchema>;
