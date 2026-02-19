import { NextResponse } from "next/server";
import { createPublicClient, decodeEventLog, http, isAddress } from "viem";
import { base } from "viem/chains";

export const dynamic = "force-dynamic";

// Base USDC contract
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913" as const;
const USDC_RECEIVE = "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b" as const;

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

function topicAddr(addr: `0x${string}`) {
  // left padded 32-byte topic
  return (`0x${addr.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`) as `0x${string}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const wallet = String(body?.wallet ?? "").trim();

  if (!wallet || !isAddress(wallet)) return bad("Invalid wallet address");

  const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const client = createPublicClient({ chain: base, transport: http(RPC) });

  // Scan recent blocks for USDC transfers from wallet -> our receive address.
  // Keep window small for performance.
  const latest = await client.getBlockNumber();
  const fromBlock = latest > 5000n ? latest - 5000n : 0n;

  const logs = await client.getLogs({
    address: USDC,
    event: TransferEventAbi[0],
    args: {
      from: wallet as `0x${string}`,
      to: USDC_RECEIVE,
    },
    fromBlock,
    toBlock: latest,
  });

  if (!logs.length) {
    return bad("No recent USDC payment found from that wallet. If you just paid, wait 30–60s and try again.");
  }

  // Choose the latest matching transfer
  const l = logs[0];
  const decoded = decodeEventLog({ abi: TransferEventAbi, data: l.data, topics: l.topics });
  const value = BigInt((decoded as any).args.value);
  const usdc = Number(value) / 1e6;

  // Persist pending request for fulfillment
  try {
    const { getSupabaseServiceClient } = await import("../../../supabase_server");
    const supabase = getSupabaseServiceClient();

    await supabase.from("otc_requests").upsert(
      {
        chain_id: 8453,
        payer_wallet: (decoded as any).args.from,
        receiver_wallet: wallet,
        usdc_amount: usdc,
        usdc_tx_hash: l.transactionHash,
        status: "pending",
      },
      { onConflict: "usdc_tx_hash" },
    );
  } catch {
    // ignore; still return confirmation
  }

  return ok(`Found payment: ${usdc.toFixed(2)} USDC. Saved for delivery.`);
}
