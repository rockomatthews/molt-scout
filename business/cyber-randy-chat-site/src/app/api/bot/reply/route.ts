import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../_supabase_admin";

export async function POST(req: Request) {
  const token = process.env.RANDY_PULL_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing RANDY_PULL_TOKEN" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad JSON" }, { status: 400 });

  const { token: t, messageId, reply } = body as {
    token?: string;
    messageId?: string;
    reply?: string;
  };

  if (t !== token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!messageId || !reply) return NextResponse.json({ error: "Missing messageId/reply" }, { status: 400 });

  const supabase = supabaseAdmin();

  // Fetch original message
  const { data: msg, error: msgErr } = await supabase
    .from("cr_messages")
    .select("id,user_id,handle,body")
    .eq("id", messageId)
    .single();

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Enforce starred trust
  const { data: prof, error: profErr } = await supabase
    .from("cr_profiles")
    .select("id,starred")
    .eq("id", msg.user_id)
    .single();
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
  if (!prof?.starred) return NextResponse.json({ error: "User not starred" }, { status: 403 });

  // Idempotency: if already replied, return ok.
  const { data: existing } = await supabase
    .from("cr_bot_replies")
    .select("message_id")
    .eq("message_id", messageId)
    .maybeSingle();
  if (existing?.message_id) return NextResponse.json({ ok: true, already: true });

  const BOT_HANDLE = "@cyber_randy";
  const { data: inserted, error: insErr } = await supabase
    .from("cr_messages")
    .insert({
      user_id: msg.user_id,
      handle: BOT_HANDLE,
      body: reply,
    })
    .select("id")
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const { error: mapErr } = await supabase
    .from("cr_bot_replies")
    .insert({ message_id: messageId, reply_id: inserted.id });
  if (mapErr) return NextResponse.json({ error: mapErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, replyId: inserted.id });
}
