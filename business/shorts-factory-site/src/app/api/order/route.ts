import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // MVP stub: accept order requests without external side effects.
  // Next step: store in Supabase or send Telegram notify (requires explicit approval).
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });

  // minimal validation
  const businessName = String(body.businessName || "").trim();
  const niche = String(body.niche || "").trim();
  const contact = String(body.contact || "").trim();

  if (!businessName || !niche || !contact) {
    return NextResponse.json({ ok: false, error: "missing_fields", required: ["businessName", "niche", "contact"] }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
