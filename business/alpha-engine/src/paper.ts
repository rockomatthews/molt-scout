import { fetchDexscreenerPriceUsd, fetchDexscreenerQuote, type DexscreenerQuote } from "./dexscreener";

export type PaperPosition = {
  tokenAddress: string;
  symbol?: string;
  qty: number;
  avgEntry: number;
  openedAtIso: string;

  // Track peak price for trailing stop / time-extension logic.
  // Optional for backward compatibility with existing state.
  peakPx?: number;
};

export type PaperState = {
  cashUsd: number;
  positions: Record<string, PaperPosition>; // tokenAddress -> position
};

export async function markPriceUsd(tokenAddress: string) {
  return fetchDexscreenerPriceUsd(tokenAddress);
}

export async function markQuote(tokenAddress: string): Promise<DexscreenerQuote | null> {
  return fetchDexscreenerQuote(tokenAddress);
}

export function positionValueUsd(pos: PaperPosition, px: number) {
  return pos.qty * px;
}

export function pnlUsd(pos: PaperPosition, px: number) {
  return (px - pos.avgEntry) * pos.qty;
}

export function shouldExit(opts: {
  pos: PaperPosition;
  px: number;
  now: Date;
  holdMinutes: number;
  takeProfitPct: number;
  stopLossPct: number;
}): { exit: boolean; reason?: string } {
  const opened = new Date(opts.pos.openedAtIso).getTime();
  const ageMin = (opts.now.getTime() - opened) / 60000;
  const ret = (opts.px - opts.pos.avgEntry) / opts.pos.avgEntry;

  // Hard exits
  if (ret >= opts.takeProfitPct) return { exit: true, reason: `take_profit_${(opts.takeProfitPct * 100).toFixed(0)}%` };
  if (ret <= -opts.stopLossPct) return { exit: true, reason: `stop_loss_${(opts.stopLossPct * 100).toFixed(0)}%` };

  // Trailing stop once a position has shown meaningful profit.
  const peakPx = typeof opts.pos.peakPx === "number" ? opts.pos.peakPx : opts.pos.avgEntry;
  const peakRet = (peakPx - opts.pos.avgEntry) / opts.pos.avgEntry;
  if (peakRet >= 0.12) {
    const trail = 0.06; // give back up to 6% from peak
    if (ret <= peakRet - trail) return { exit: true, reason: `trail_${Math.round(trail * 100)}%_from_peak` };
  }

  // Time exit: if it's slightly green, let it run to try to reach TP.
  // If it's flat/red after the hold window, recycle capital.
  if (ageMin >= opts.holdMinutes) {
    if (ret >= 0.03) return { exit: false }; // extend winners
    return { exit: true, reason: `time_${opts.holdMinutes}m` };
  }

  return { exit: false };
}
