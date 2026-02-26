import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase_admin";

// Hot Potato: join the single global room (max 10 players).
export async function POST(req) {
  try {
    const body = await req.json();
    const { address } = body || {};
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const supabase = supabaseAdmin();
    const addr = String(address).toLowerCase();

    // Ensure state row exists
    await supabase
      .from("arc_hotpotato_state")
      .upsert({ id: "global" }, { onConflict: "id" })
      .select("id")
      .maybeSingle();

    // Check existing
    const { data: existing } = await supabase
      .from("arc_hotpotato_players")
      .select("address")
      .eq("address", addr)
      .maybeSingle();

    if (!existing) {
      const { count } = await supabase
        .from("arc_hotpotato_players")
        .select("address", { count: "exact", head: true });

      if ((count || 0) >= 10) {
        return NextResponse.json({ error: "Room full (10/10)" }, { status: 400 });
      }

      const { error: insErr } = await supabase
        .from("arc_hotpotato_players")
        .insert({ address: addr });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    // If we hit 10 players and game not started, start countdown and assign potato.
    const { data: players } = await supabase
      .from("arc_hotpotato_players")
      .select("address")
      .order("created_at", { ascending: true });

    const list = (players || []).map((p) => p.address);

    const { data: state } = await supabase
      .from("arc_hotpotato_state")
      .select("started_at,countdown_ends_at,potato_holder,loser")
      .eq("id", "global")
      .single();

    if (list.length === 10 && !state.started_at && !state.loser) {
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + 3 * 60 * 1000);
      const potato = list[Math.floor(Math.random() * list.length)];
      await supabase
        .from("arc_hotpotato_state")
        .update({
          started_at: startedAt.toISOString(),
          countdown_ends_at: endsAt.toISOString(),
          potato_holder: potato,
          potato_since: startedAt.toISOString(),
        })
        .eq("id", "global");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
