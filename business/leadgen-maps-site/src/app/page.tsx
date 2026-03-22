"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [query, setQuery] = useState("Roofers in Denver, CO");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: "url(/assets/bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.45))",
        }}
      >
        <div
          style={{
            width: "min(760px, 100%)",
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.55)",
            color: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: 0.2 }}>LeadGen Maps</div>
          <h1 style={{ margin: "8px 0 6px 0", fontSize: 30 }}>Find local businesses fast</h1>
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            Search “<b>niche</b> in <b>city</b>” → get a downloadable lead list.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/leads?query=${encodeURIComponent(query)}&limit=40`;
            }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Web designers in Austin, TX"
              style={{
                flex: "1 1 380px",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.16)",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Search →
            </button>
            <a
              href="/leads"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.15)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Latest
            </a>
          </form>

          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
            Tip: keep it simple. “<b>roofers in denver</b>”, “<b>dentists in scottsdale</b>”, etc.
          </div>

          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
            <Link href="/leads" style={{ color: "white" }}>
              View leads table
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
