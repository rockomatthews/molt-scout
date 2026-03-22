"use client";

import Link from "next/link";
import { useState } from "react";
import MapInit from "./_MapInit";

export default function HomePage() {
  const [query, setQuery] = useState("Roofers in Denver, CO");
  const [lat, setLat] = useState<number | null>(39.7392);
  const [lng, setLng] = useState<number | null>(-104.9903);
  const [mapsReady, setMapsReady] = useState(false);

  // lazy-load Google Maps JS API
  const ensureMaps = () => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.maps) {
      setMapsReady(true);
      return;
    }
    if ((window as any).__maps_loading) return;
    (window as any).__maps_loading = true;

    const key = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as any) || "";
    const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => setMapsReady(true);
    document.head.appendChild(s);
  };

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
              const qs = new URLSearchParams();
              qs.set("query", query);
              qs.set("limit", "40");
              if (lat != null && lng != null) {
                qs.set("lat", String(lat));
                qs.set("lng", String(lng));
                qs.set("radius", "20000");
              }
              window.location.href = `/leads?${qs.toString()}`;
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
            Tip: keep it simple. “<b>roofers</b> in <b>denver</b>”, “<b>dentists</b> in <b>scottsdale</b>”, etc.
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>
              Location (click map to set)
            </div>

            <div
              onMouseEnter={ensureMaps}
              onTouchStart={ensureMaps}
              style={{
                height: 260,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.18)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.06)",
                position: "relative",
              }}
              id="map"
            />

            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
              Using: {lat?.toFixed(4)},{lng?.toFixed(4)} (20km radius)
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
            <Link href="/leads" style={{ color: "white" }}>
              View leads table
            </Link>
          </div>

          <MapInit
            ready={mapsReady}
            lat={lat}
            lng={lng}
            onPick={(a, b) => {
              setLat(a);
              setLng(b);
            }}
          />
        </div>
      </div>
    </main>
  );
}
