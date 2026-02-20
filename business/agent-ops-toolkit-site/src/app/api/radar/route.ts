import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  const { data } = await supabase
    .from("clawn_radar")
    .select("id, created_at, symbol, name, post_url, trade_url, note")
    .order("created_at", { ascending: false })
    .limit(3);

  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}
