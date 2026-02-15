import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

function requireEnv(k) {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}

function compile() {
  const contractPath = path.resolve('contracts/AOT.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: { 'AOT.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  };

  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  if (out.errors?.length) {
    const fatal = out.errors.filter((e) => e.severity === 'error');
    for (const e of out.errors) console.error(e.formattedMessage);
    if (fatal.length) throw new Error('Solc compilation failed');
  }

  const c = out.contracts['AOT.sol']?.AOT;
  if (!c) throw new Error('Contract not found in compilation output');
  return { abi: c.abi, bytecode: c.evm.bytecode.object };
}

(async () => {
  const BASE_RPC_URL = requireEnv('BASE_RPC_URL');
  const PRIVATE_KEY = requireEnv('PRIVATE_KEY');

  const INITIAL_OWNER = (process.env.INITIAL_OWNER ?? '').trim();
  if (!INITIAL_OWNER) throw new Error('Missing env: INITIAL_OWNER');

  const TOTAL_SUPPLY = BigInt(process.env.TOTAL_SUPPLY ?? '0');
  if (TOTAL_SUPPLY <= 0n) throw new Error('Missing/invalid env: TOTAL_SUPPLY');

  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log('Deploying from:', account.address);
  console.log('Initial owner:', INITIAL_OWNER);
  console.log('Total supply:', TOTAL_SUPPLY.toString());

  const publicClient = createPublicClient({ chain: base, transport: http(BASE_RPC_URL) });
  const walletClient = createWalletClient({ chain: base, transport: http(BASE_RPC_URL), account });

  const { abi, bytecode } = compile();

  const hash = await walletClient.deployContract({
    abi,
    bytecode: `0x${bytecode}`,
    args: [INITIAL_OWNER, TOTAL_SUPPLY],
  });

  console.log('txHash:', hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('status:', receipt.status);
  console.log('contractAddress:', receipt.contractAddress);

  if (!receipt.contractAddress) process.exit(1);
})();
