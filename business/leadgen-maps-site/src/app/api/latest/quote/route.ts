import { NextResponse } from "next/server";
import { BASE_USDC, getMerchantAddress } from "../../_402lib";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const format = (u.searchParams.get("format") || "csv").toLowerCase();

  // Pricing: $1 JSON, $5 CSV (CSV unlocks both)
  const amountUsdc = format === "json" ? "1" : "5";

  const to = getMerchantAddress();

  return NextResponse.json({
    ok: true,
    chain: "base",
    token: "USDC",
    tokenAddress: BASE_USDC,
    to,
    amountUsdc,
    format,
    note: "Send a USDC transfer on Base to unlock the latest lead list download.",
  });
}
