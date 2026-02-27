import { NextResponse } from "next/server";
import { getMerchantAddress } from "../_lib";

// Minimal 402-style quote.
// Client pays USDC on Base to MERCHANT_BASE_ADDRESS, then calls /verify with txHash.
export async function GET() {
  try {
    const merchant = getMerchantAddress();
    return NextResponse.json({
      chain: "base",
      token: "USDC",
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      merchant,
      // Default price for our first paid action.
      priceUsdc: process.env.PPA_PRICE_USDC || "5",
      note: "Send a Base USDC transfer to merchant, then POST txHash to /api/402/verify",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || "Server error" }, { status: 500 });
  }
}
