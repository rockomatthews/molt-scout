import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress, decodeEventLog } from "viem";
import { base } from "viem/chains";

// Base USDC (native) contract
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913" as const;
const USDC_RECEIVE = "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b" as const;

const UsdcTransferAbi = [
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
  const txHash = String(body?.txHash ?? "").trim();

  if (!wallet || !isAddress(wallet)) return bad("Invalid wallet address");
  if (!txHash.startsWith("0x") || txHash.length !== 66) return bad("Invalid tx hash");

  const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const client = createPublicClient({ chain: base, transport: http(RPC) });

  const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` }).catch(() => null);
  if (!receipt) return bad("Tx not found on Base (yet). Wait 30s and retry.");
  if (receipt.status !== "success") return bad("Tx failed");

  // Find a USDC Transfer(to=USDC_RECEIVE)
  const transfers = receipt.logs
    .filter((l) => l.address.toLowerCase() === USDC.toLowerCase())
    .map((l) => {
      try {
        return decodeEventLog({ abi: UsdcTransferAbi, data: l.data, topics: l.topics });
      } catch {
        return null;
      }
    })
    .filter(Boolean) as any[];

  const hit = transfers.find((e) => e.eventName === "Transfer" && (e.args?.to as string)?.toLowerCase() === USDC_RECEIVE.toLowerCase());
  if (!hit) return bad("No USDC transfer to receiving address found in this tx");

  const value = BigInt(hit.args.value);
  // USDC has 6 decimals
  const usdc = Number(value) / 1e6;

  // Log for manual processing (Vercel logs)
  console.log(JSON.stringify({ kind: "otc_request", wallet, txHash, usdc, at: new Date().toISOString() }));

  return ok(`Verified: received ${usdc.toFixed(2)} USDC. Logged for manual AOT delivery.`);
}
