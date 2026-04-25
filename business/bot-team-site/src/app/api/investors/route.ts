import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await fetch(
      "https://raw.githubusercontent.com/rockomatthews/molt-scout/master/business/alpha-engine/logs/polymarket_loop.json",
      { cache: "no-store" }
    );

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream snapshot fetch failed: ${r.status}` },
        { status: 502 }
      );
    }

    const j = await r.json();
    return NextResponse.json(j, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
