"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { formatUnits, isAddress } from "viem";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";

import { AotErc20Abi } from "../aot_erc20_abi";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AOT_TOKEN_ADDRESS as `0x${string}` | undefined;
const PRO_THRESHOLD = BigInt(process.env.NEXT_PUBLIC_AOT_PRO_THRESHOLD ?? "100000");

export default function TokenPage() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const tokenReady = !!TOKEN_ADDRESS && isAddress(TOKEN_ADDRESS);

  const decimalsQ = useReadContract({
    abi: AotErc20Abi,
    address: tokenReady ? TOKEN_ADDRESS : undefined,
    functionName: "decimals",
    query: { enabled: tokenReady },
  });

  const symbolQ = useReadContract({
    abi: AotErc20Abi,
    address: tokenReady ? TOKEN_ADDRESS : undefined,
    functionName: "symbol",
    query: { enabled: tokenReady },
  });

  const balQ = useReadContract({
    abi: AotErc20Abi,
    address: tokenReady ? TOKEN_ADDRESS : undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: tokenReady && !!address },
  });

  const decimals = Number(decimalsQ.data ?? 18);
  const symbol = (symbolQ.data as string | undefined) ?? "AOT";
  const bal = (balQ.data as bigint | undefined) ?? 0n;

  const unlocked = tokenReady && isConnected && bal >= PRO_THRESHOLD;

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 860 }}>
        <Typography variant="h3" fontWeight={900}>
          AOT Token Gate (Base)
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Hold AOT on Base to unlock Pro assets. Subscriptions will later fund buybacks → staking rewards.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-start", pt: 1 }}>
          {isConnected ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <Typography sx={{ opacity: 0.8 }}>
                Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
                {chain?.name ? ` on ${chain.name}` : ""}
              </Typography>
              <Button variant="outlined" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {connectors.map((c) => (
                <Button
                  key={c.uid}
                  variant="contained"
                  onClick={() => connect({ connector: c })}
                  disabled={connectStatus === "pending"}
                >
                  Connect {c.name}
                </Button>
              ))}
            </Stack>
          )}
        </Box>

        {connectError && (
          <Typography sx={{ opacity: 0.7 }}>Wallet connect error: {connectError.message}</Typography>
        )}

        {!tokenReady ? (
          <Box sx={{ p: 3, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={800}>Token not deployed yet</Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Gating is wired, but the token address isn’t set. After deployment, we’ll set
                <code> NEXT_PUBLIC_AOT_TOKEN_ADDRESS</code> in Vercel.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button href="/" variant="outlined">
                  Back
                </Button>
                <Button href="/subscribe" variant="contained">
                  Subscribe instead
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ p: 3, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={800}>Your status</Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Pro unlock threshold: {PRO_THRESHOLD.toString()} {symbol}
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Your balance: {Number.isFinite(decimals) ? formatUnits(bal, decimals) : bal.toString()} {symbol}
              </Typography>

              {(decimalsQ.isLoading || balQ.isLoading || symbolQ.isLoading) && (
                <Typography sx={{ opacity: 0.7 }}>Loading onchain data…</Typography>
              )}

              {(decimalsQ.error || balQ.error || symbolQ.error) && (
                <Typography sx={{ opacity: 0.7 }}>
                  Couldn’t read token data. Make sure your wallet is on Base and the token address is correct.
                </Typography>
              )}

              {unlocked ? (
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Unlocked: Pro
                  </Typography>
                  <Typography sx={{ opacity: 0.85, mt: 1 }}>
                    Next: we’ll put the Pro downloads here (templates, runbooks, installers).
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                    <Button variant="contained" disabled>
                      Download Pro Pack (next)
                    </Button>
                    <Button href="/" variant="outlined">
                      Back
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Locked
                  </Typography>
                  <Typography sx={{ opacity: 0.85, mt: 1 }}>
                    Hold enough AOT to unlock Pro, or subscribe for access.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                    <Button href="/subscribe" variant="contained">
                      Subscribe
                    </Button>
                    <Button href="/" variant="outlined">
                      Back
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        <Typography sx={{ opacity: 0.7 }}>
          Utility token only. No onchain deployment will happen until you explicitly approve go-live.
        </Typography>
      </Stack>
    </Container>
  );
}
