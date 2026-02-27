import { NextResponse } from "next/server";
import { getMerchantAddress, verifyUsdcPaymentTx } from "../_lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const txHash = body?.txHash as `0x${string}` | undefined;
    const from = body?.from as `0x${string}` | undefined;

    if (!txHash || !txHash.startsWith("0x")) {
      return NextResponse.json({ error: "Missing txHash" }, { status: 400 });
    }

    const merchant = getMerchantAddress();
    const priceUsdc = process.env.PPA_PRICE_USDC || "5";

    const v = await verifyUsdcPaymentTx({
      txHash,
      to: merchant,
      from,
      minAmountUsdc: priceUsdc,
    });

    if (!v.ok) {
      return NextResponse.json({ ok: false, reason: v.reason }, { status: 402 });
    }

    return NextResponse.json({ ok: true, priceUsdc, merchant, paidFrom: v.paidFrom, paidTo: v.paidTo });
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || "Server error" }, { status: 500 });
  }
}
