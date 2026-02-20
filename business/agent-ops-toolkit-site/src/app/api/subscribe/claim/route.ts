import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { base } from "viem/chains";

export const dynamic = "force-dynamic";

// Base USDC
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913" as const;

const RECEIVE = (process.env.NEXT_PUBLIC_USDC_RECEIVE_ADDRESS ??
  "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b") as `0x${string}`;

const PRO_USDC = Number(process.env.NEXT_PUBLIC_USDC_PRO_MONTHLY ?? "49");
const TEAMS_USDC = Number(process.env.NEXT_PUBLIC_USDC_TEAMS_MONTHLY ?? "199");

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

  if (!wallet || !isAddress(wallet)) return bad("Invalid Base wallet address (0x…)");
  if (tier !== "pro" && tier !== "teams") return bad("Invalid tier");

  const want = tier === "teams" ? TEAMS_USDC : PRO_USDC;

  const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const client = createPublicClient({ chain: base, transport: http(RPC) });

  // Scan recent USDC transfers from wallet -> RECEIVE.
  const latest = await client.getBlockNumber();
  const fromBlock = latest > 8000n ? latest - 8000n : 0n; // ~20-30 min window

  const logs = await client.getLogs({
    address: USDC,
    event: {
      type: "event",
      name: "Transfer",
      inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        { indexed: false, name: "value", type: "uint256" },
      ],
      anonymous: false,
    },
    args: {
      from: wallet as `0x${string}`,
      to: RECEIVE,
    },
    fromBlock,
    toBlock: latest,
  });

  if (!logs.length) {
    return bad("No recent USDC payment found from that wallet. If you just paid, wait 30–60s and try again.");
  }

  // Pick the largest payment in the window.
  let best = logs[0];
  for (const l of logs) {
    const lv = (l as any).args?.value as bigint | undefined;
    const bv = (best as any).args?.value as bigint | undefined;
    if (lv !== undefined && bv !== undefined && lv > bv) best = l;
  }

  const bestValue = ((best as any).args?.value as bigint | undefined) ?? 0n;
  const usdc = Number(bestValue) / 1e6;
  if (usdc + 1e-9 < want) {
    return bad(`Found payment ${usdc.toFixed(2)} USDC, but ${want} USDC required for ${tier.toUpperCase()}.`);
  }

  const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Save subscription record (best-effort)
  try {
    const { getSupabaseServiceClient } = await import("../../../supabase_server");
    const supabase = getSupabaseServiceClient();

    await supabase.from("subscriptions").upsert(
      {
        wallet,
        tier,
        status: "active",
        paid_until: paidUntil,
        last_payment_tx: best.transactionHash,
        last_amount_usdc: usdc,
      },
      { onConflict: "wallet" },
    );
  } catch {
    // ignore
  }

  return ok(`✅ ${tier.toUpperCase()} activated until ${paidUntil}. (Payment: ${usdc.toFixed(2)} USDC)`);
}
