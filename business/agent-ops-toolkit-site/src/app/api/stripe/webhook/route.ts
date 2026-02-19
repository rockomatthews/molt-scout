import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

async function readRawBody(req: Request) {
  const buf = Buffer.from(await req.arrayBuffer());
  return buf;
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new NextResponse("Stripe not configured", { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const raw = await readRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook error: ${err?.message ?? "bad signature"}`, { status: 400 });
  }

  // Optional: store status in Supabase if configured
  try {
    const { getSupabaseServiceClient } = await import("../../../supabase_server");
    const supabase = getSupabaseServiceClient();

    const obj: any = event.data.object;

    const record = {
      stripe_event_id: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString(),
      customer: obj.customer ?? null,
      subscription: obj.subscription ?? obj.id ?? null,
      status: obj.status ?? null,
      raw: event as any,
    };

    // best-effort insert (table may not exist yet)
    await supabase.from("stripe_events").insert(record);
  } catch {
    // ignore
  }

  return NextResponse.json({ received: true });
}
