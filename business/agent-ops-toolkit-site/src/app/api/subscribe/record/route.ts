import { NextResponse } from "next/server";
import { createPublicClient, decodeEventLog, http, isAddress } from "viem";
import { base } from "viem/chains";

export const dynamic = "force-dynamic";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913" as const;
const RECEIVE = (process.env.NEXT_PUBLIC_USDC_RECEIVE_ADDRESS ??
  "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b") as `0x${string}`;

const PRO_USDC = Number(process.env.NEXT_PUBLIC_USDC_PRO_MONTHLY ?? "49");
const TEAMS_USDC = Number(process.env.NEXT_PUBLIC_USDC_TEAMS_MONTHLY ?? "199");

const TransferEventAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    anonymous: false,
  },
] as const;

function ok(text: string) {
  return new NextResponse(text, { status: 200 });
}
function bad(text: string) {
  return new NextResponse(text, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const wallet = String(body?.wallet ?? "").trim();
  const tier = String(body?.tier ?? "pro").toLowerCase();
  const txHash = String(body?.txHash ?? "").trim();

  if (!wallet || !isAddress(wallet)) return bad("Invalid wallet");
  if (tier !== "pro" && tier !== "teams") return bad("Invalid tier");
  if (!txHash.startsWith("0x") || txHash.length !== 66) return bad("Invalid tx hash");

  const want = tier === "teams" ? TEAMS_USDC : PRO_USDC;

  const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const client = createPublicClient({ chain: base, transport: http(RPC) });

  const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` }).catch(() => null);
  if (!receipt) return bad("Tx not found (yet). Wait 15–30s and retry.");
  if (receipt.status !== "success") return bad("Tx failed");

  const transfers = receipt.logs
    .filter((l) => l.address.toLowerCase() === USDC.toLowerCase())
    .map((l) => {
      try {
        return decodeEventLog({ abi: TransferEventAbi, data: l.data, topics: l.topics });
      } catch {
        return null;
      }
    })
    .filter(Boolean) as any[];

  const hit = transfers.find(
    (e) =>
      e.eventName === "Transfer" &&
      String(e.args?.from).toLowerCase() === wallet.toLowerCase() &&
      String(e.args?.to).toLowerCase() === RECEIVE.toLowerCase(),
  );

  if (!hit) return bad("No USDC transfer found from your wallet to the subscription address");

  const usdc = Number(BigInt(hit.args.value)) / 1e6;
  if (usdc + 1e-9 < want) return bad(`Payment ${usdc.toFixed(2)} USDC is below required ${want} USDC`);

  const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { getSupabaseServiceClient } = await import("../../../supabase_server");
    const supabase = getSupabaseServiceClient();

    await supabase.from("subscriptions").upsert(
      {
        wallet,
        tier,
        status: "active",
        paid_until: paidUntil,
        last_payment_tx: txHash,
        last_amount_usdc: usdc,
      },
      { onConflict: "wallet" },
    );
  } catch {
    // ignore
  }

  return ok(`✅ ${tier.toUpperCase()} active until ${paidUntil}. (Payment: ${usdc.toFixed(2)} USDC)`);
}
