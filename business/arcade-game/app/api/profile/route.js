import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase_admin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { address, username, avatarSeed, avatarUrl } = body || {};

    if (!address || !username || !avatarSeed) {
      return NextResponse.json({ error: "Missing address/username/avatarSeed" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Upsert profile (unique username enforced by DB index)
    const { error } = await supabase.from("arc_profiles").upsert(
      {
        address,
        username,
        avatar_seed: avatarSeed,
        avatar_url: avatarUrl ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "address" }
    );

    if (error) {
      // If username conflicts, Postgres will throw unique violation.
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
