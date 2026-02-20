"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";

import { UsdcAbi } from "../usdc_abi";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913" as const;
const RECEIVE = (process.env.NEXT_PUBLIC_USDC_RECEIVE_ADDRESS ??
  "0x57585874DBf39B18df1AD2b829F18D6BFc2Ceb4b") as `0x${string}`;

const PRO = Number(process.env.NEXT_PUBLIC_USDC_PRO_MONTHLY ?? "49");
const TEAMS = Number(process.env.NEXT_PUBLIC_USDC_TEAMS_MONTHLY ?? "199");

export default function SubscribePage() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const [tier, setTier] = React.useState<"pro" | "teams">("pro");
  const [status, setStatus] = React.useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const amount = tier === "teams" ? TEAMS : PRO;

  async function pay() {
    if (!isConnected || !address) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!isAddress(RECEIVE)) {
      setStatus("Subscription address not configured.");
      return;
    }

    if (chain?.id !== base.id) {
      setStatus("Switching to Base…");
      await switchChainAsync({ chainId: base.id });
    }

    setStatus(`Opening wallet… sending ${amount} USDC`);

    const value = parseUnits(String(amount), 6);

    const txHash = await writeContractAsync({
      address: USDC,
      abi: UsdcAbi,
      functionName: "transfer",
      args: [RECEIVE, value],
    });

    setStatus(`Payment sent. Confirming… (${txHash.slice(0, 10)}…)`);

    // Record + activate (server verifies receipt)
    const res = await fetch("/api/subscribe/record", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet: address, tier, txHash }),
    });
    const text = await res.text();
    setStatus(res.ok ? text : `Error: ${text}`);
  }

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2} sx={{ maxWidth: 900 }}>
        <Typography variant="h3" fontWeight={900}>
          Subscribe (USDC on Base)
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          USDC-only. Connect your wallet and pay in one click.
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={900}>Subscription address</Typography>
              <Typography sx={{ fontFamily: "monospace", opacity: 0.85 }}>{RECEIVE}</Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Pro: {PRO} USDC / month · Teams: {TEAMS} USDC / month
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <Typography fontWeight={900}>1) Connect wallet</Typography>
              {isConnected ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                  <Typography sx={{ opacity: 0.85 }}>
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
              {connectError && <Typography sx={{ opacity: 0.7 }}>Connect error: {connectError.message}</Typography>}

              <Typography fontWeight={900} sx={{ pt: 1 }}>
                2) Choose plan
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant={tier === "pro" ? "contained" : "outlined"} onClick={() => setTier("pro")}>
                  Pro ({PRO} USDC)
                </Button>
                <Button variant={tier === "teams" ? "contained" : "outlined"} onClick={() => setTier("teams")}>
                  Teams ({TEAMS} USDC)
                </Button>
              </Stack>

              <Typography fontWeight={900} sx={{ pt: 1 }}>
                3) Pay with USDC
              </Typography>
              <Button variant="contained" onClick={pay} disabled={!isConnected || isPending}>
                Pay {amount} USDC
              </Button>

              {status && <Typography sx={{ opacity: 0.85 }}>{status}</Typography>}

              <Typography sx={{ opacity: 0.7, fontSize: 13, pt: 1 }}>
                Safety: We will never ask for your seed phrase.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Button href="/" variant="outlined">
            Back
          </Button>
        </Box>

        {!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && (
          <Typography sx={{ opacity: 0.65, fontSize: 13 }}>
            Note: WalletConnect not configured yet. MetaMask/Coinbase extension will work; mobile WalletConnect requires
            a project id.
          </Typography>
        )}
      </Stack>
    </Container>
  );
}
