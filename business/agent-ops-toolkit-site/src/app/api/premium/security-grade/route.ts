import { NextResponse } from "next/server";
import { getMerchantAddress, verifyUsdcPaymentTx } from "../../402/_lib";

// Paid endpoint (first money endpoint): "Security Grade (Lite)".
// For now this returns a structured plan + next steps. We can expand to run scans server-side later.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const repoUrl = String(body?.repoUrl || "").trim();
    const txHash = body?.txHash as `0x${string}` | undefined;
    const from = body?.from as `0x${string}` | undefined;

    if (!repoUrl.startsWith("http")) {
      return NextResponse.json({ error: "Missing/invalid repoUrl" }, { status: 400 });
    }
    if (!txHash || !txHash.startsWith("0x")) {
      return NextResponse.json({ error: "Missing txHash" }, { status: 400 });
    }

    const merchant = getMerchantAddress();
    const priceUsdc = process.env.PPA_PRICE_USDC || "5";

    const v = await verifyUsdcPaymentTx({ txHash, to: merchant, from, minAmountUsdc: priceUsdc });
    if (!v.ok) {
      return NextResponse.json({ ok: false, reason: v.reason }, { status: 402 });
    }

    // Stubbed “lite” report. Next iteration: generate real findings with OSS scanners.
    const report = {
      kind: "security-grade-lite",
      repoUrl,
      grade: "PENDING_AUTOSCAN",
      summary:
        "Payment verified. Next step is to run automated OSS security checks (dependency vulns, secrets, config).",
      deliverables: [
        "Dependency vuln scan (OSV / npm audit)",
        "Secret scan (gitleaks)",
        "Config checks (basic Next.js / env exposure / headers)",
      ],
      eta: "< 1 hour (manual pipeline) / < 5 min once automated",
    };

    return NextResponse.json({ ok: true, priceUsdc, merchant, payment: v, report });
  } catch (e) {
    return NextResponse.json({ error: (e as any)?.message || "Server error" }, { status: 500 });
  }
}
