"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, usePublicClient } from "wagmi";

const BOTSQUAD_TOKEN = process.env.NEXT_PUBLIC_BOTSQUAD_TOKEN as `0x${string}` | undefined;

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export default function MemberDropsPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, status } = useConnect();
  const { disconnect } = useDisconnect();
  const client = usePublicClient();

  const [bal, setBal] = useState<bigint | null>(null);
  const [err, setErr] = useState<string>("");

  const hasToken = bal !== null && bal > 0n;

  const connectable = useMemo(
    () => connectors.filter((c) => c.type !== "injected" || (typeof window !== "undefined" && (window as any).ethereum)),
    [connectors]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr("");
      setBal(null);

      if (!isConnected || !address) return;
      if (!BOTSQUAD_TOKEN) {
        setErr("BOTSQUAD contract not set yet. (Token not deployed/configured.)");
        return;
      }
      if (!client) return;

      try {
        const v = (await client.readContract({
          address: BOTSQUAD_TOKEN,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        })) as bigint;

        if (!cancelled) setBal(v);
      } catch (e: any) {
        if (!cancelled) setErr(e?.shortMessage || e?.message || String(e));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isConnected, address, client]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px" }}>
      <h1 style={{ fontSize: 40, margin: 0 }}>Member Drops</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        BOTSQUAD utility: holders unlock drops + templates + discounts on x402 tools.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        {!isConnected ? (
          connectable.map((c) => (
            <button
              key={c.id}
              onClick={async () => {
                setErr("");
                try {
                  await connectAsync({ connector: c });
                } catch (e: any) {
                  setErr(e?.shortMessage || e?.message || String(e));
                }
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              Connect {c.name}
            </button>
          ))
        ) : (
          <>
            <div style={{ opacity: 0.85, padding: "10px 12px" }}>
              Connected: <b>{address?.slice(0, 6)}…{address?.slice(-4)}</b>
            </div>
            <button
              onClick={() => disconnect()}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {status === "pending" ? <p style={{ opacity: 0.7 }}>Connecting…</p> : null}
      {err ? <p style={{ color: "#fca5a5" }}>{err}</p> : null}

      <section
        style={{
          marginTop: 22,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          padding: 18,
        }}
      >
        {!isConnected ? (
          <>
            <h2 style={{ marginTop: 0 }}>Locked</h2>
            <p style={{ opacity: 0.85 }}>
              Connect your wallet to check BOTSQUAD balance.
            </p>
          </>
        ) : !BOTSQUAD_TOKEN ? (
          <>
            <h2 style={{ marginTop: 0 }}>Not live yet</h2>
            <p style={{ opacity: 0.85 }}>
              Token contract isn’t configured. Once BOTSQUAD is deployed, this page becomes the holder portal.
            </p>
            <p style={{ opacity: 0.7, fontSize: 13 }}>
              Dev note: set <code>NEXT_PUBLIC_BOTSQUAD_TOKEN</code> in Vercel.
            </p>
          </>
        ) : bal === null ? (
          <>
            <h2 style={{ marginTop: 0 }}>Checking…</h2>
            <p style={{ opacity: 0.85 }}>Reading your balance on Base.</p>
          </>
        ) : hasToken ? (
          <>
            <h2 style={{ marginTop: 0 }}>Unlocked</h2>
            <p style={{ opacity: 0.85 }}>
              You have BOTSQUAD. Welcome.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 12 }}>
              <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                <b>Drop #1</b>
                <p style={{ opacity: 0.8, marginTop: 8 }}>
                  MCP x402 Paywall Starter Kit (docs + examples)
                </p>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                <b>Drop #2</b>
                <p style={{ opacity: 0.8, marginTop: 8 }}>
                  USDC receipt verification templates (server + client)
                </p>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                <b>Drop #3</b>
                <p style={{ opacity: 0.8, marginTop: 8 }}>
                  Webhook + idempotency templates
                </p>
              </div>
            </div>

            <p style={{ opacity: 0.65, marginTop: 14, fontSize: 13 }}>
              Next: downloads + tool discounts (Tier 2).
            </p>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>Locked</h2>
            <p style={{ opacity: 0.85 }}>
              You don’t currently hold BOTSQUAD.
            </p>
            <p style={{ opacity: 0.65, fontSize: 13 }}>
              Once live, this page will include the official contract and safe-buy links.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
