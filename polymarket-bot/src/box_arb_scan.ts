import { loadEnv } from "./env.js";
import { log } from "./logger.js";
import { makeClob } from "./clob.js";
import { autoPickMarkets, type Market } from "./markets.js";
import { bestAsk, fetchBook } from "./orderbook.js";

function feeBufferFromBps(bps: number) {
  return bps / 10_000;
}

function calcProfitUsd(size: number, sumPrices: number, feeFracTotal: number) {
  // Pay sumPrices now; settle at 1.0 if one side wins.
  // Approx friction modeled as feeFracTotal (conservative).
  return size * (1 - sumPrices - feeFracTotal);
}

(async () => {
  const env = loadEnv();
  const { host } = await makeClob();

  const markets: Market[] = env.MARKET_SLUGS.length
    ? // If you set MARKET_SLUGS, the main bot already has the slug resolver.
      // For scan mode, we keep it simple: just auto-pick if slugs aren't set.
      await autoPickMarkets(host, env.MARKET_COUNT)
    : await autoPickMarkets(host, env.MARKET_COUNT);

  const feeFrac = feeBufferFromBps(env.FEE_BPS);

  const opps: any[] = [];

  for (const m of markets) {
    if (!m.active || m.closed || m.archived || !m.accepting_orders || !m.enable_order_book) continue;
    if (m.tokens.length !== 2) continue;

    const [t0, t1] = m.tokens;

    const [b0, b1] = await Promise.all([fetchBook(host, t0.token_id), fetchBook(host, t1.token_id)]);
    const a0 = bestAsk(b0);
    const a1 = bestAsk(b1);
    if (!a0 || !a1) continue;

    const sum = a0.price + a1.price;
    const edgeRaw = 1 - sum;

    // Sizing caps
    const maxSizeByUsd = env.MAX_USD_PER_TRADE / sum;
    const size = Math.floor(Math.min(maxSizeByUsd, a0.size, a1.size));

    if (size < env.MIN_SIZE_SHARES) continue;
    if (size < m.minimum_order_size) continue;

    const profitUsd = calcProfitUsd(size, sum, feeFrac);
    if (profitUsd < env.MIN_PROFIT_USD) continue;

    opps.push({
      slug: m.market_slug,
      question: m.question,
      outcomes: [t0.outcome, t1.outcome],
      asks: [a0, a1],
      sum,
      edgeRaw,
      feeBps: env.FEE_BPS,
      size,
      estCostUsd: size * sum,
      estProfitUsd: profitUsd,
      url: `https://polymarket.com/market/${m.market_slug}`,
    });
  }

  opps.sort((a, b) => b.estProfitUsd - a.estProfitUsd);

  if (opps.length) {
    log.warn({ top: opps.slice(0, 5) }, "BOX_ARB_SCAN hits");
  } else {
    log.info({ checked: markets.length }, "BOX_ARB_SCAN: no hits");
  }

  // stdout-friendly summary
  console.log(
    JSON.stringify(
      {
        checked: markets.length,
        hits: opps.length,
        top: opps.slice(0, 5).map((o) => ({ slug: o.slug, sum: o.sum, size: o.size, estProfitUsd: o.estProfitUsd, url: o.url })),
      },
      null,
      2,
    ),
  );
})();
