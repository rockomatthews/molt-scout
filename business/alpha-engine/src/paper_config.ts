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

    // Control how fast we add risk even if capacity remains.
    maxEntriesPerRun: z.number().int().positive().default(2),

    // Second-signal strength (buy pressure)
    minBuySellRatio24h: z.number().positive().default(1.5),

    // Quote quality gate (0..1). Prevents trading on inconsistent marks.
    minQuoteConfidence: z.number().min(0).max(1).default(0.55),

    // Momentum sanity gate (avoid chasing extreme 24h pumps that mean-revert)
    maxMomentum24hPct: z.number().nonnegative().default(300),

    // Volatility / churn proxies (when candles are missing)
    // volume24hUsd / liquidityUsd too high often means unstable, dump-prone markets.
    maxVolToLiq24h: z.number().nonnegative().default(8),

    // Candle-based guards (when candles exist)
    wickinessMax: z.number().nonnegative().default(6),
    maxRange15mPct: z.number().nonnegative().default(12)
  })
  .default({});

export type PaperConfig = z.infer<typeof PaperSchema>;
