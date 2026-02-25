import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../_supabase_admin";

// Fetch latest messages that mention @cyber_randy and are not yet replied-to.
export async function GET(req: Request) {
  const token = process.env.RANDY_PULL_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing RANDY_PULL_TOKEN" }, { status: 500 });

  const url = new URL(req.url);
  const t = url.searchParams.get("token");
  if (t !== token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseAdmin();

  const { data: msgs, error: msgErr } = await supabase
    .from("cr_messages")
    .select("id,created_at,handle,body,user_id")
    .ilike("body", "%@cyber_randy%")
    .order("created_at", { ascending: false })
    .limit(25);

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  const { data: replied } = await supabase
    .from("cr_bot_replies")
    .select("message_id")
    .in(
      "message_id",
      (msgs || []).map((m: any) => m.id)
    );

  const repliedSet = new Set((replied || []).map((r: any) => r.message_id));
  const pending = (msgs || []).filter((m: any) => !repliedSet.has(m.id));

  return NextResponse.json({ pending });
}
