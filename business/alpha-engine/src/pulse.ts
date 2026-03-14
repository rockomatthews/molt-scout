import { z } from 'zod';

const GQL_URL = 'https://api.wallet.xyz/graphql';

export type PulseTx = {
  hash?: string;
  walletAddress: string;
  // wallet.xyz often returns both a primary token and an "other" paired token.
  // We keep both so downstream can pick the correct purchased asset safely.
  tokenAddress?: string;
  otherTokenAddress?: string;
  otherTokenSymbol?: string;
  chain?: string;
  type?: string;
  amountUsd?: number;
  marketCap?: number;
  timestamp?: string;
};

const PulseTxSchema = z.object({
  walletAddress: z.string(),
  tokenAddress: z.string().optional().nullable(),
  otherTokenAddress: z.string().optional().nullable(),
  otherTokenSymbol: z.string().optional().nullable(),
  chain: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  amountUsd: z.number().optional().nullable(),
  marketCap: z.number().optional().nullable(),
  hash: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable(),
});

async function gql<T>(query: string, variables: any): Promise<T> {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`wallet.xyz gql http ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`wallet.xyz gql error: ${json.errors[0]?.message ?? 'unknown'}`);
  return json.data;
}

export async function getPulseTokenTransactions(opts: {
  limit?: number;
  offset?: number;
  amountMinUsd?: number;
  marketCapMaxUsd?: number;
  onlyWithProfile?: boolean;
}): Promise<PulseTx[]> {
  const query = `
    query PulseTx($input: PulseTokenTransactionsInput) {
      pulseTokenTransactions(input: $input) {
        nextOffset
        transactions {
          txHash
          timestamp
          networkId
          type
          tokenAddress
          tokenType
          valueUsd
          tokenMarketCap
          actorAddress
          otherTokenSymbol
          otherTokenAddress
        }
      }
    }
  `;

  const variables = {
    input: {
      limit: opts.limit ?? 50,
      offset: opts.offset ?? 0,
      transactionTypes: ['BUY'],
      amountMin: opts.amountMinUsd ?? 1000,
      marketCapMax: opts.marketCapMaxUsd ?? 50_000_000,
      onlyWithProfile: opts.onlyWithProfile ?? true,
    },
  };

  const data = await gql<{ pulseTokenTransactions: { transactions: any[] } }>(query, variables);
  const txs = data.pulseTokenTransactions?.transactions ?? [];
  return txs.map((x) =>
    PulseTxSchema.parse({
      walletAddress: x.actorAddress,
      // Keep BOTH; downstream will decide which address is the purchased token.
      tokenAddress: x.tokenAddress,
      otherTokenAddress: x.otherTokenAddress,
      otherTokenSymbol: x.otherTokenSymbol,
      chain: String(x.networkId),
      type: x.type,
      amountUsd: x.valueUsd,
      marketCap: x.tokenMarketCap,
      hash: x.txHash,
      timestamp: x.timestamp,
    }),
  );
}
