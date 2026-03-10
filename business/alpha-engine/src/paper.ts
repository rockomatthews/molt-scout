import { fetchDexscreenerPriceUsd } from "./dexscreener.js";

export type PaperPosition = {
  tokenAddress: string;
  symbol?: string;
  qty: number;
  avgEntry: number;
  openedAtIso: string;
};

export type PaperState = {
  cashUsd: number;
  positions: Record<string, PaperPosition>; // tokenAddress -> position
};

export async function markPriceUsd(tokenAddress: string) {
  return fetchDexscreenerPriceUsd(tokenAddress);
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

  if (ret >= opts.takeProfitPct) return { exit: true, reason: `take_profit_${(opts.takeProfitPct * 100).toFixed(0)}%` };
  if (ret <= -opts.stopLossPct) return { exit: true, reason: `stop_loss_${(opts.stopLossPct * 100).toFixed(0)}%` };
  if (ageMin >= opts.holdMinutes) return { exit: true, reason: `time_${opts.holdMinutes}m` };

  return { exit: false };
}
