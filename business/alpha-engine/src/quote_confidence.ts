import { fetchDexscreenerQuote } from "./dexscreener.js";
import { fetchBestPoolForTokenBase, fetchPoolOhlcvBase } from "./candles.js";

export type QuoteConfidence = {
  tokenAddress: string;
  priceUsd?: number;
  liqUsd?: number;
  vol24hUsd?: number;
  txns24h?: number;
  buySellRatio24h?: number;
  poolAddress?: string;
  ohlcvLastClose?: number;
  ohlcvCandles?: number;
  confidence: number; // 0..1
  reasons: string[];
};

export async function quoteConfidenceBase(tokenAddress: string): Promise<QuoteConfidence> {
  const addr = tokenAddress.toLowerCase();
  const reasons: string[] = [];

  const q = await fetchDexscreenerQuote(addr);
  const liq = q?.liquidityUsd ?? 0;
  const vol = q?.volume24hUsd ?? 0;
  const txns = q?.txns24h?.total ?? 0;
  const buys = q?.txns24h?.buys ?? 0;
  const sells = q?.txns24h?.sells ?? 0;
  const ratio = sells > 0 ? buys / sells : buys > 0 ? 99 : 0;

  let score = 0;

  // Price present
  if (q?.priceUsd && q.priceUsd > 0) {
    score += 0.25;
  } else {
    reasons.push("no_dex_price");
  }

  // Liquidity
  if (liq >= 100_000) score += 0.25;
  else if (liq >= 25_000) score += 0.18;
  else if (liq >= 10_000) score += 0.10;
  else reasons.push("low_liquidity");

  // Activity
  if (vol >= 250_000 && txns >= 1000) score += 0.25;
  else if (vol >= 50_000 && txns >= 250) score += 0.18;
  else if (vol >= 10_000 && txns >= 50) score += 0.10;
  else reasons.push("low_activity");

  // Buy pressure
  if (ratio >= 1.25) score += 0.10;
  else if (ratio >= 1.05) score += 0.06;
  else reasons.push("weak_buy_pressure");

  // Candle consistency check (GeckoTerminal pool OHLCV close ~= quote price)
  let poolAddress: string | undefined;
  try {
    poolAddress = (await fetchBestPoolForTokenBase(addr)) ?? undefined;
    if (poolAddress) {
      const candles = await fetchPoolOhlcvBase({ poolAddress, timeframe: "minute", aggregate: 15, limit: 4 });
      const last = candles[candles.length - 1];
      if (last?.c && Number.isFinite(last.c)) {
        const close = last.c;
        const px = q?.priceUsd ?? null;
        if (px && px > 0) {
          const rel = Math.abs(close - px) / px;
          if (rel <= 0.05) score += 0.15;
          else if (rel <= 0.15) score += 0.07;
          else reasons.push("price_inconsistent");
        } else {
          score += 0.05; // at least we got a candle close
        }
        return {
          tokenAddress: addr,
          priceUsd: q?.priceUsd,
          liqUsd: liq,
          vol24hUsd: vol,
          txns24h: txns,
          buySellRatio24h: ratio,
          poolAddress,
          ohlcvLastClose: close,
          ohlcvCandles: candles.length,
          confidence: Math.max(0, Math.min(1, score)),
          reasons,
        };
      }
    }
  } catch {
    // ignore
  }

  reasons.push("no_candles");
  return {
    tokenAddress: addr,
    priceUsd: q?.priceUsd,
    liqUsd: liq,
    vol24hUsd: vol,
    txns24h: txns,
    buySellRatio24h: ratio,
    poolAddress,
    confidence: Math.max(0, Math.min(1, score)),
    reasons,
  };
}
