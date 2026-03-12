import { NextResponse } from "next/server";
import { supabasePublic } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const sb = supabasePublic();
  if (!sb) {
    return NextResponse.json({
      ok: false,
      error: "missing_env",
      hint: "Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY",
    });
  }

  const { data, error } = await sb
    .from("crp_topics")
    .select("slug,title,description,solved,solved_criteria")
    .eq("slug", "cure-cancer")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, topic: data });
}
