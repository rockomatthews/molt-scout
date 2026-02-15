import { MEMECOIN_SMARTMONEY_COHORTS, type Cohort } from './cohorts/index.js';

export type CohortSignal = {
  cohortId: string;
  chain: string;
  wallet: string;
  kind: 'wallet_seen_in_pulse';
  txHash?: string;
  summary?: string;
};

function indexWallets(cohorts: Cohort[]) {
  const m = new Map<string, { cohortId: string; chain: string; label: string }[]>();
  for (const c of cohorts) {
    for (const w of c.wallets) {
      const key = w;
      const arr = m.get(key) ?? [];
      arr.push({ cohortId: c.id, chain: c.chain, label: c.label });
      m.set(key, arr);
    }
  }
  return m;
}

const WALLET_INDEX = indexWallets(MEMECOIN_SMARTMONEY_COHORTS);

// Simple matcher we can call from anywhere.
export function matchCohortsByWallet(wallet: string) {
  return WALLET_INDEX.get(wallet) ?? [];
}
