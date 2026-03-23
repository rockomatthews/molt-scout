import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getMerchantAddress, verifyUsdcPaymentTx } from "../../_402lib";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const format = (u.searchParams.get("format") || "csv").toLowerCase();
  const txHash = (u.searchParams.get("txHash") || "") as `0x${string}`;

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return NextResponse.json({ ok: false, error: "missing_or_invalid_txHash" }, { status: 400 });
  }

  const minAmountUsdc = format === "json" ? "1" : "5";
  const to = getMerchantAddress();

  const v = await verifyUsdcPaymentTx({ txHash, to, minAmountUsdc });
  if (!v.ok) {
    return NextResponse.json(
      { ok: false, error: "payment_not_verified", reason: (v as any).reason, minAmountUsdc },
      { status: 402 }
    );
  }

  const p = path.resolve(process.cwd(), "public", "leads", format === "json" ? "latest.json" : "latest.csv");
  const buf = await fs.readFile(p);

  return new NextResponse(buf, {
    headers: {
      "content-type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename=latest.${format === "json" ? "json" : "csv"}`,
      "cache-control": "no-store",
    },
  });
}
