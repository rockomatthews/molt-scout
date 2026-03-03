import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../_supabase_admin";

export async function POST(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Missing ADMIN_PASSWORD" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad JSON" }, { status: 400 });

  const { password, userId, starred } = body as {
    password?: string;
    userId?: string;
    starred?: boolean;
  };

  const got = (password ?? "").trim();
  const expected = (adminPassword ?? "").trim();
  if (!got || got !== expected) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Check that ADMIN_PASSWORD is set on Vercel and that you entered it exactly (no extra spaces).",
      },
      { status: 401 }
    );
  }
  if (!userId || typeof starred !== "boolean") {
    return NextResponse.json({ error: "Missing userId/starred" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("cr_profiles").update({ starred }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
