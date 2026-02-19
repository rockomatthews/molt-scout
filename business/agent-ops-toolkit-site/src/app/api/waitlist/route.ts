import { NextResponse } from "next/server";
import { isAddress } from "viem";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

function ok(text: string) {
  return new NextResponse(text, { status: 200 });
}

function bad(text: string) {
  return new NextResponse(text, { status: 400 });
}

function getClientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.WAITLIST_IP_SALT || "";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const wallet = String(body?.wallet ?? "").trim();

  if (!wallet || !isAddress(wallet)) return bad("Invalid Base wallet address (must start with 0x)");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return bad("waitlist database not configured");

  const { getSupabaseServiceClient } = await import("../../supabase_server");
  const supabase = getSupabaseServiceClient();

  // simple anti-spam: 3 submits/day per IP
  const ip_hash = hashIp(getClientIp(req));
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ip_hash)
    .gte("created_at", since);

  if ((count ?? 0) >= 3) return bad("Too many requests. Try again later.");

  const { error } = await supabase.from("waitlist").insert({ wallet, ip_hash });

  if (error) {
    // unique violation means already joined
    return ok("You’re already on the list.");
  }

  return ok("You’re on the waitlist. Airdrop will be free to addresses on this list.");
}
