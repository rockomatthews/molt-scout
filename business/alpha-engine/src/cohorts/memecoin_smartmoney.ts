export type Cohort = {
  id: string;
  chain: 'solana' | 'base' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | string;
  label: string;
  source: string;
  wallets: string[];
};

// Initial memecoin smart-money cohort seed.
// Source: Nansen blog (public article) scraped via Firecrawl.
// NOTE: These are Solana addresses (base58), included as a starting point.
export const MEMECOIN_SMARTMONEY_COHORTS: Cohort[] = [
  {
    id: 'nansen-memecoin-top10-2025-solana',
    chain: 'solana',
    label: 'Nansen: Top 10 Memecoin Wallets to Track (2025)',
    source: 'https://www.nansen.ai/post/top-10-memecoin-wallets-to-track-for-2025',
    wallets: [
      '4EtAJ1p8RjqccEVhEhaYnEgQ6kA4JHR8oYqyLFwARUj6',
      'EdCNh8EzETJLFphW8yvdY7rDd8zBiyweiz8DU5gUUUka',
      '8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd',
      '8mZYBV8aPvPCo34CyCmt6fWkZRFviAUoBZr1Bn993gro',
      '5CP6zv8a17mz91v6rMruVH6ziC5qAL8GFaJzwrX9Fvup',
      'H2ikJvq8or5MyjvFowD7CDY6fG3Sc2yi4mxTnfovXy3K',
      '2h7s3FpSvc6v2oHke6Uqg191B5fPCeFTmMGnh5oPWhX7',
      'HWdeCUjBvPP1HJ5oCJt7aNsvMWpWoDgiejUWvfFX6T7R',
      '4DPxYoJ5DgjvXPUtZdT3CYUZ3EEbSPj4zMNEVFJTd1Ts',
      'Hwz4BDgtDRDBTScpEKDawshdKatZJh6z1SJYmRUxTxKE',
    ],
  },
];
