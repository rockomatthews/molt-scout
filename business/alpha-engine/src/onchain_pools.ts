import { createPublicClient, http, parseUnits, formatUnits } from 'viem';

export const baseClient = createPublicClient({
  chain: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
  },
  transport: http(process.env.BASE_RPC_URL ?? 'https://mainnet.base.org'),
});

export const PairAbi = [
  {
    type: 'function',
    name: 'token0',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'token1',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'getReserves',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '_reserve0', type: 'uint112' },
      { name: '_reserve1', type: 'uint112' },
      { name: '_blockTimestampLast', type: 'uint32' },
    ],
  },
  {
    // Solidly/Aerodrome style
    type: 'function',
    name: 'stable',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export function getAmountOutVolatile(amountIn: bigint, reserveIn: bigint, reserveOut: bigint, feeBps: bigint) {
  // UniswapV2-style with fee
  // amountInWithFee = amountIn * (10000-fee)/10000
  const amountInWithFee = (amountIn * (10000n - feeBps)) / 10000n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn + amountInWithFee;
  if (denominator === 0n) return 0n;
  return numerator / denominator;
}

export async function fetchPairInfo(pairAddress: `0x${string}`) {
  const [token0, token1, reserves, stable] = await Promise.all([
    baseClient.readContract({ address: pairAddress, abi: PairAbi, functionName: 'token0' }),
    baseClient.readContract({ address: pairAddress, abi: PairAbi, functionName: 'token1' }),
    baseClient.readContract({ address: pairAddress, abi: PairAbi, functionName: 'getReserves' }),
    // stable() not present on all pools; handle failures
    baseClient
      .readContract({ address: pairAddress, abi: PairAbi, functionName: 'stable' })
      .catch(() => false as any),
  ]);

  const reserve0 = BigInt((reserves as any)[0]);
  const reserve1 = BigInt((reserves as any)[1]);
  return { token0: token0 as `0x${string}`, token1: token1 as `0x${string}`, reserve0, reserve1, stable: Boolean(stable) };
}

export function quoteFromReserves(opts: {
  amountInFloat: number;
  amountInDecimals: number;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  reserve0: bigint;
  reserve1: bigint;
  feeBps?: number;
}) {
  const feeBps = BigInt(opts.feeBps ?? 30); // default 0.30%
  const amountIn = parseUnits(String(opts.amountInFloat), opts.amountInDecimals);

  const inIs0 = opts.tokenIn.toLowerCase() === opts.token0.toLowerCase();
  const outIs1 = opts.tokenOut.toLowerCase() === opts.token1.toLowerCase();
  const inIs1 = opts.tokenIn.toLowerCase() === opts.token1.toLowerCase();
  const outIs0 = opts.tokenOut.toLowerCase() === opts.token0.toLowerCase();

  if (inIs0 && outIs1) {
    return getAmountOutVolatile(amountIn, opts.reserve0, opts.reserve1, feeBps);
  }
  if (inIs1 && outIs0) {
    return getAmountOutVolatile(amountIn, opts.reserve1, opts.reserve0, feeBps);
  }
  return null;
}

export function fmt(amount: bigint, decimals: number) {
  return Number(formatUnits(amount, decimals));
}
