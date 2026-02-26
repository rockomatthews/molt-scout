"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {connectors.map((c) => (
          <button key={c.uid} className="button" onClick={() => connect({ connector: c })}>
            Connect {c.name}
          </button>
        ))}
        <div className="small" style={{ opacity: 0.8 }}>
          {status === "pending" ? "Connecting…" : ""}
          {error ? ` ${error.message}` : ""}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <span className="badge">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
      <button className="button" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
