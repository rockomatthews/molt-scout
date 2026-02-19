import { NextResponse } from "next/server";
import crypto from "node:crypto";

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

function getClientIp(req: Request): string {
  // Vercel/Proxies
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.REVIEW_IP_SALT || "";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function looksSpammy(comment: string) {
  const low = comment.toLowerCase();
  // Basic link spam filter
  if (low.includes("http://") || low.includes("https://") || low.includes("www.")) return true;
  // Excessive repeated chars
  if (/(.)\1{8,}/.test(comment)) return true;
  return false;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? "").trim();
  const honey = String(body?.website ?? "").trim(); // honeypot field

  if (honey) return badJson("spam");

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return badJson("rating must be 1-5");
  if (!comment || comment.length < 3) return badJson("comment too short");
  if (comment.length > 1000) return badJson("comment too long");
  if (looksSpammy(comment)) return badJson("links/repeated spam not allowed");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return badJson("reviews database not configured");

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  const ip = getClientIp(req);
  const ip_hash = hashIp(ip);

  // Rate limit: 1 review per 24h per IP hash
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("reviews")
    .select("id, created_at")
    .eq("ip_hash", ip_hash)
    .gte("created_at", since)
    .limit(1);

  if (recent && recent.length) return badJson("rate limited (try again tomorrow)");

  const { error } = await supabase.from("reviews").insert({ rating, comment, ip_hash });
  if (error) return badJson("failed to save review");

  return okJson({ ok: true });
}
