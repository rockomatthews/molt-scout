import { z } from 'zod';

export const OkxPaperSchema = z
  .object({
    enabled: z.boolean().default(false),

    // Instruments to trade (perps)
    instIds: z.array(z.string()).default(['BTC-USDT-SWAP', 'ETH-USDT-SWAP']),

    // Candles
    bar: z.string().default('1m'),
    limit: z.number().int().positive().default(120),

    // Risk / execution params (paper)
    leverage: z.number().positive().default(3),
    maxPositions: z.number().int().positive().default(20),
    maxEntriesPerRun: z.number().int().positive().default(5),

    // Signal tuning
    breakoutLookback: z.number().int().positive().default(20),
    atrMaxPct: z.number().positive().default(0.8),

    // Exits
    takeProfitPct: z.number().positive().default(1.2),
    stopLossPct: z.number().positive().default(0.8),
    trailFromPeakPct: z.number().positive().default(0.6),
    minHoldMinutes: z.number().int().positive().default(2),
  })
  .default({});

export type OkxPaperConfig = z.infer<typeof OkxPaperSchema>;
