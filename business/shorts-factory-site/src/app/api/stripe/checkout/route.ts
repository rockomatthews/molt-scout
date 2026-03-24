import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!siteUrl) return NextResponse.json({ ok: false, error: "missing_SITE_URL" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });

  const tier = String(body.tier || "standard");

  // You must create Stripe Prices in the dashboard and paste the price ids into env.
  const priceId =
    tier === "starter"
      ? process.env.STRIPE_PRICE_STARTER
      : tier === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_STANDARD;

  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "missing_price_id", hint: "Set STRIPE_PRICE_STARTER/ STANDARD/ MONTHLY" },
      { status: 500 }
    );
  }

  const successUrl = `${siteUrl.replace(/\/$/, "")}/subscribe/success`;
  const cancelUrl = `${siteUrl.replace(/\/$/, "")}/subscribe/cancel`;

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: tier === "monthly" ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      // Basic metadata (safe; no secrets)
      "metadata[tier]": tier,
      "metadata[businessName]": String(body.businessName || ""),
      "metadata[niche]": String(body.niche || ""),
      "metadata[city]": String(body.city || ""),
      "metadata[offer]": String(body.offer || ""),
      "metadata[website]": String(body.website || ""),
      "metadata[contact]": String(body.contact || ""),
    }),
  });

  const text = await stripeRes.text();
  if (!stripeRes.ok) {
    return NextResponse.json({ ok: false, error: "stripe_error", detail: text }, { status: 500 });
  }

  const session = JSON.parse(text);
  return NextResponse.json({ ok: true, url: session.url, id: session.id });
}
