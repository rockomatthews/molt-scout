import { createPublicClient, decodeEventLog, http, isAddress, parseUnits } from "viem";
import { base } from "viem/chains";

export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

const ERC20_TRANSFER_ABI = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
] as const;

export function getMerchantAddress() {
  const addr = process.env.MERCHANT_BASE_ADDRESS;
  if (!addr) throw new Error("Missing MERCHANT_BASE_ADDRESS");
  if (!isAddress(addr)) throw new Error("MERCHANT_BASE_ADDRESS is not a valid address");
  return addr;
}

export function baseClient() {
  const rpc = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  return createPublicClient({ chain: base, transport: http(rpc) });
}

export function usdcAmountToUnits(amountUsdc: string) {
  // USDC has 6 decimals on Base.
  return parseUnits(amountUsdc, 6);
}

export async function verifyUsdcPaymentTx(opts: {
  txHash: `0x${string}`;
  to: `0x${string}`;
  minAmountUsdc: string;
  from?: `0x${string}`;
}) {
  const { txHash, to, from, minAmountUsdc } = opts;
  const client = baseClient();

  const receipt = await client.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    return { ok: false as const, reason: "tx_failed" as const };
  }

  const minValue = usdcAmountToUnits(minAmountUsdc);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== BASE_USDC.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: ERC20_TRANSFER_ABI,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Transfer") continue;
      const args = decoded.args as unknown as { from: string; to: string; value: bigint };

      if (args.to.toLowerCase() !== to.toLowerCase()) continue;
      if (from && args.from.toLowerCase() !== from.toLowerCase()) continue;
      if (args.value < minValue) continue;

      return {
        ok: true as const,
        paidValue: args.value,
        paidTo: args.to,
        paidFrom: args.from,
      };
    } catch {
      // not our event
    }
  }

  return { ok: false as const, reason: "no_matching_transfer" as const };
}
