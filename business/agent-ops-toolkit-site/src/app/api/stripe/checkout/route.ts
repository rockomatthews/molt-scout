import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const tier = String(body?.tier ?? "pro").toLowerCase();

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agenttoolkit.xyz";
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const priceId =
    tier === "teams" ? process.env.STRIPE_PRICE_ID_TEAMS_MONTHLY : process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: "Missing Stripe price id" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/subscribe?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
