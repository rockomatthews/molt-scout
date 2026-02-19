import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function okJson(obj: any) {
  return NextResponse.json(obj, { status: 200 });
}

function badJson(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  // If Supabase isn't configured, return empty list (site still works).
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return okJson({ reviews: [], avg: null, count: 0 });

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, created_at, rating, comment")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) return okJson({ reviews: [], avg: null, count: 0 });

  const count = data?.length ?? 0;
  const avg = count ? data.reduce((s: number, r: any) => s + Number(r.rating), 0) / count : null;

  return okJson({ reviews: data ?? [], avg, count });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? "").trim();

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return badJson("rating must be 1-5");
  if (!comment || comment.length < 3) return badJson("comment too short");
  if (comment.length > 1000) return badJson("comment too long");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return badJson("reviews database not configured");

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.from("reviews").insert({ rating, comment });
  if (error) return badJson("failed to save review");

  return okJson({ ok: true });
}
