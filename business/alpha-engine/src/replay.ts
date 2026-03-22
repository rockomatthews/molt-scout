import fs from "node:fs/promises";
import path from "node:path";

type Quote = {
  priceUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  txns24h: { buys: number; sells: number; total: number };
  priceChange24hPct: number;
  dexId?: string;
  pairUrl?: string;
  quoteConfidence?: { confidence?: number; reasons?: string[] };
};

type PulseTx = {
  chain?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  otherTokenAddress?: string;
};

type Snapshot = {
  day: string;
  runIds: string[];
  pulseTxs: PulseTx[];
  quotes: Record<string, Quote>;
};

function scratchpadIsoFromFilename(filename: string): string | null {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z_/);
  if (!m) return null;
  const [, d, hh, mm, ss, ms] = m;
  return `${d}T${hh}:${mm}:${ss}.${ms}Z`;
}

function mtDayFromIso(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

async function listScratchpadsForDay(root: string, day: string) {
  const spDir = path.join(root, ".scratchpad");
  const files = await fs.readdir(spDir).catch(() => [] as string[]);
  return files
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => ({ f, iso: scratchpadIsoFromFilename(f) }))
    .filter((x) => x.iso && mtDayFromIso(x.iso) === day)
    .sort((a, b) => String(a.iso).localeCompare(String(b.iso)))
    .map((x) => path.join(spDir, x.f));
}

export async function loadReplaySnapshot(root: string, day: string): Promise<Snapshot> {
  const spPaths = await listScratchpadsForDay(root, day);
  const pulseTxs: PulseTx[] = [];
  const quotes: Record<string, Quote> = {};
  const runIds: string[] = [];

  for (const spPath of spPaths) {
    const raw = await fs.readFile(spPath, "utf8").catch(() => "");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      let obj: any;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      if (obj?.runId && !runIds.includes(obj.runId)) runIds.push(obj.runId);
      const data = obj?.data;
      if (data?.kind === "pulse_txs" && Array.isArray(data?.txs)) {
        for (const t of data.txs) pulseTxs.push(t);
      }
      if (data?.kind === "paper_quotes" && data?.quotes && typeof data.quotes === "object") {
        for (const [addr, q] of Object.entries<any>(data.quotes)) {
          if (!q) continue;
          quotes[String(addr).toLowerCase()] = {
            priceUsd: Number(q.priceUsd),
            liquidityUsd: Number(q.liquidityUsd),
            volume24hUsd: Number(q.volume24hUsd),
            txns24h: {
              buys: Number(q?.txns24h?.buys || 0),
              sells: Number(q?.txns24h?.sells || 0),
              total: Number(q?.txns24h?.total || 0),
            },
            priceChange24hPct: Number(q.priceChange24hPct || 0),
            dexId: q.dexId,
            pairUrl: q.pairUrl,
            quoteConfidence: q.quoteConfidence
              ? { confidence: Number(q.quoteConfidence.confidence ?? 0), reasons: Array.isArray(q.quoteConfidence.reasons) ? q.quoteConfidence.reasons : [] }
              : undefined,
          };
        }
      }
    }
  }

  return { day, runIds, pulseTxs, quotes };
}

export function simulateEntries(opts: {
  pulseTxs: PulseTx[];
  quotes: Record<string, Quote>;
  paper: {
    maxPositions: number;
    maxEntriesPerRun: number;
    minLiquidityUsd: number;
    minVolume24hUsd: number;
    minTxns24h: number;
    minPriceUsd: number;
    minBuySellRatio24h: number;
    minMomentum24hPct: number;
    scoreMode?: "legacy" | "factors";
    scoreWeights?: { momentum?: number; buyPressure?: number; activity?: number; liquidity?: number; confidence?: number };
  };
}) {
  const diag: Record<string, number> = {
    candidates: 0,
    missing_quote: 0,
    skipped_liquidity: 0,
    skipped_activity: 0,
    skipped_price: 0,
    skipped_confirmation2: 0,
    selected: 0,
  };

  const MAJOR_DENY = new Set([
    "0x4200000000000000000000000000000000000006",
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  ]);

  const pickPurchasedTokenAddress = (tx: any) => {
    const a = (tx.tokenAddress ? String(tx.tokenAddress) : "").toLowerCase();
    const b = (tx.otherTokenAddress ? String(tx.otherTokenAddress) : "").toLowerCase();
    if (a && b) {
      const aMajor = MAJOR_DENY.has(a);
      const bMajor = MAJOR_DENY.has(b);
      if (aMajor && !bMajor) return b;
      if (bMajor && !aMajor) return a;
    }
    return a || b || "";
  };

  const candidates: Array<{ addr: string; score: number; q: Quote; px: number }> = [];

  function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
  }

  function factorScore(q: Quote) {
    const w = opts.paper.scoreWeights || {};
    const W = {
      momentum: Number(w.momentum ?? 0.25),
      buyPressure: Number(w.buyPressure ?? 0.20),
      activity: Number(w.activity ?? 0.25),
      liquidity: Number(w.liquidity ?? 0.20),
      confidence: Number(w.confidence ?? 0.10),
    };

    // normalize inputs to ~0..1 using soft caps/logs
    const mom = clamp01((Number(q.priceChange24hPct || 0) - 1) / 25); // 1%..26% → 0..1

    const buys = q.txns24h?.buys || 0;
    const sells = q.txns24h?.sells || 0;
    const ratio = sells > 0 ? buys / sells : buys > 0 ? 3 : 0;
    const bp = clamp01((Math.min(3, ratio) - 1) / 2); // 1..3 → 0..1

    const tx = Number(q.txns24h?.total || 0);
    const vol = Number(q.volume24hUsd || 0);
    const activity = clamp01(Math.log10(1 + tx) / 3) * 0.5 + clamp01(Math.log10(1 + vol) / 6) * 0.5;

    const liq = Number(q.liquidityUsd || 0);
    const liqN = clamp01(Math.log10(1 + liq) / 6);

    const conf = clamp01(Number(q.quoteConfidence?.confidence ?? 0));

    const denom = W.momentum + W.buyPressure + W.activity + W.liquidity + W.confidence;
    const s =
      W.momentum * mom +
      W.buyPressure * bp +
      W.activity * activity +
      W.liquidity * liqN +
      W.confidence * conf;

    return denom > 0 ? s / denom : s;
  }

  for (const tx of opts.pulseTxs.slice(0, 25)) {
    const addr = pickPurchasedTokenAddress(tx);
    if (!addr) continue;
    diag.candidates++;
    if (MAJOR_DENY.has(addr)) continue;

    const q = opts.quotes[addr];
    if (!q) {
      diag.missing_quote++;
      continue;
    }
    const px = Number(q.priceUsd);
    if (!Number.isFinite(px) || px <= 0 || px < opts.paper.minPriceUsd) {
      diag.skipped_price++;
      continue;
    }
    if ((q.liquidityUsd || 0) < opts.paper.minLiquidityUsd) {
      diag.skipped_liquidity++;
      continue;
    }
    if ((q.volume24hUsd || 0) < opts.paper.minVolume24hUsd || (q.txns24h?.total || 0) < opts.paper.minTxns24h) {
      diag.skipped_activity++;
      continue;
    }

    const buys = q.txns24h?.buys || 0;
    const sells = q.txns24h?.sells || 0;
    const ratio = sells > 0 ? buys / sells : buys > 0 ? 99 : 0;
    if ((q.priceChange24hPct || 0) < opts.paper.minMomentum24hPct || ratio < opts.paper.minBuySellRatio24h) {
      diag.skipped_confirmation2++;
      continue;
    }

    const scoreMode = opts.paper.scoreMode || "legacy";
    const score =
      scoreMode === "factors"
        ? factorScore(q)
        : (q.volume24hUsd || 0) * Math.max(1, q.txns24h?.total || 0) + (q.liquidityUsd || 0);
    candidates.push({ addr, score, q, px });
  }

  candidates.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const selected: Array<{ addr: string; score: number; q: Quote; px: number }> = [];
  for (const c of candidates) {
    if (selected.length >= Math.min(opts.paper.maxEntriesPerRun, opts.paper.maxPositions)) break;
    if (seen.has(c.addr)) continue;
    seen.add(c.addr);
    selected.push(c);
  }
  diag.selected = selected.length;

  return { selected, diag };
}
