import "dotenv/config";

export type TradeIntent = {
  ticker: string;
  side: "BUY" | "SELL";
  usdSize: number;
  reason: string;
};

export async function proposeTrade(_context: {
  ticker: string;
  text: string;
  usdPerTrade: number;
}): Promise<TradeIntent | null> {
  // Stub: we'll use Bankr once you provide BANKR_API_KEY and confirm venue specifics.
  // For now we only return null so the engine runs in DRY_RUN without placing trades.
  return null;
}

export async function executeTrade(_intent: TradeIntent): Promise<{ ok: boolean; id?: string; note?: string }> {
  // Stub: will route through Bankr skill/API.
  return { ok: false, note: "BANKR execution not configured" };
}
