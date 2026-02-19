import { createClient } from '@supabase/supabase-js';
import { createPublicClient, createWalletClient, http, isAddress, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const AotErc20Abi = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

function env(k) {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}

function tierAotAmount(usdc) {
  // Default tiers (keep in sync with /otc page)
  if (usdc >= 199) return 1_000_000;
  if (usdc >= 49) return 100_000;
  return 0;
}

(async () => {
  const SUPABASE_URL = env('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
  const BASE_RPC_URL = env('BASE_RPC_URL');
  const AOT_TOKEN_ADDRESS = env('AOT_TOKEN_ADDRESS');
  const DISTRIBUTOR_PRIVATE_KEY = env('DISTRIBUTOR_PRIVATE_KEY');

  if (!isAddress(AOT_TOKEN_ADDRESS)) throw new Error('Invalid AOT_TOKEN_ADDRESS');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const account = privateKeyToAccount(DISTRIBUTOR_PRIVATE_KEY);
  console.log('Distributor:', account.address);

  const publicClient = createPublicClient({ chain: base, transport: http(BASE_RPC_URL) });
  const walletClient = createWalletClient({ chain: base, transport: http(BASE_RPC_URL), account });

  const { data: rows, error } = await supabase
    .from('otc_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(25);

  if (error) throw error;
  if (!rows?.length) {
    console.log('No pending rows');
    return;
  }

  for (const r of rows) {
    const usdc = Number(r.usdc_amount);
    const aot = tierAotAmount(usdc);

    if (!aot) {
      await supabase.from('otc_requests').update({ status: 'error', error: `usdc too low: ${usdc}` }).eq('id', r.id);
      console.log('Skip (too low):', r.id, usdc);
      continue;
    }

    const to = r.receiver_wallet;
    if (!isAddress(to)) {
      await supabase.from('otc_requests').update({ status: 'error', error: 'bad receiver wallet' }).eq('id', r.id);
      console.log('Bad wallet:', r.id);
      continue;
    }

    const value = parseUnits(String(aot), 18);

    try {
      const hash = await walletClient.writeContract({
        address: AOT_TOKEN_ADDRESS,
        abi: AotErc20Abi,
        functionName: 'transfer',
        args: [to, value],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error('transfer tx failed');

      await supabase
        .from('otc_requests')
        .update({ status: 'fulfilled', aot_amount: aot, aot_tx_hash: hash })
        .eq('id', r.id);

      console.log('Fulfilled:', r.id, '→', to, aot, 'AOT', hash);
    } catch (e) {
      const msg = e?.message ? String(e.message) : String(e);
      await supabase.from('otc_requests').update({ status: 'error', error: msg }).eq('id', r.id);
      console.log('Error:', r.id, msg);
    }
  }
})();
