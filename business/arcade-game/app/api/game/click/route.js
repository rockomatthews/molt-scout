import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase_admin";

function ms(t) {
  const x = Date.parse(t);
  return Number.isFinite(x) ? x : 0;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { address } = body || {};
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const supabase = supabaseAdmin();
    const addr = String(address).toLowerCase();

    const { data: state, error: stErr } = await supabase
      .from("arc_hotpotato_state")
      .select("*")
      .eq("id", "global")
      .single();
    if (stErr) return NextResponse.json({ error: stErr.message }, { status: 500 });

    if (!state.started_at || !state.countdown_ends_at) {
      return NextResponse.json({ error: "Game not started" }, { status: 400 });
    }
    if (state.loser) return NextResponse.json({ ok: true, loser: state.loser });

    const now = Date.now();
    const ends = ms(state.countdown_ends_at);

    // If time expired, whoever holds potato loses.
    if (now >= ends) {
      const loser = state.potato_holder;
      await supabase
        .from("arc_hotpotato_state")
        .update({ loser, finished_at: new Date().toISOString() })
        .eq("id", "global");
      return NextResponse.json({ ok: true, loser });
    }

    if (state.potato_holder !== addr) {
      return NextResponse.json({ ok: true, note: "Not holding potato" });
    }

    // 5 second max hold
    const since = ms(state.potato_since);
    if (since && now - since > 5000) {
      const loser = addr;
      await supabase
        .from("arc_hotpotato_state")
        .update({ loser, finished_at: new Date().toISOString() })
        .eq("id", "global");
      return NextResponse.json({ ok: true, loser });
    }

    const { data: players } = await supabase
      .from("arc_hotpotato_players")
      .select("address")
      .order("created_at", { ascending: true });

    const list = (players || []).map((p) => p.address).filter((a) => a !== addr);
    if (!list.length) return NextResponse.json({ error: "No other players" }, { status: 400 });

    const next = list[Math.floor(Math.random() * list.length)];
    await supabase
      .from("arc_hotpotato_state")
      .update({
        potato_holder: next,
        potato_since: new Date().toISOString(),
        last_pass_from: addr,
        last_pass_to: next,
      })
      .eq("id", "global");

    return NextResponse.json({ ok: true, passedTo: next });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
