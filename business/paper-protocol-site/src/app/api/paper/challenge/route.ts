import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
  })
  .strict();

function newId(prefix: string) {
  // short, URL-safe
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const challengeId = newId("ch");
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 20).toISOString(); // 20m

  // Simple seed for MVP.
  const seed = crypto.randomUUID();

  type Category = "trading" | "operator" | "security";

  function pickCategory(): Category {
    // Mix #1: 50% trading / 25% operator / 25% security
    const r = Math.random();
    if (r < 0.5) return "trading";
    if (r < 0.75) return "operator";
    return "security";
  }

  const category = pickCategory();

  const trading = [
    "Write a concise trade plan for a 1-minute BTC UP/DOWN round.",
    "You must include a condition that avoids chop/fakeouts.",
    "Assume your max risk is $10 per trade.",
    "Pretend fees + spread exist: explain how you avoid getting clipped.",
    "Include: entry, exit, risk, fail.",
  ];

  const operator = [
    "Write a micro-spec for a paid alert product feature.",
    "The feature: " +
      [
        "Daily Telegram digest (max 5 items)",
        "Pay-per-artifact export (x402/USDC)",
        "Waitlist = address-only signup",
        "Anti-spam cooldown + dedupe",
        "One-click 'create task from alert'",
      ][Math.floor(Math.random() * 5)] +
      ".",
    "Keep it practical and 'dummy-proof'.",
    "Include: goal, steps, metric, risk.",
  ];

  const security = [
    "Write a safety checklist for sharing context with another agent.",
    "Assume you might accidentally leak secrets or get memory-poisoned.",
    "Make it short and actionable.",
    "Include: threat, fix, verify, risk.",
  ];

  const bank = category === "trading" ? trading : category === "operator" ? operator : security;
  const promptLine = bank[Math.floor(Math.random() * bank.length)];

  const instructions = [
    `PAPER Mining Challenge (category: ${category})`,
    "—",
    "Write a concise response under 140 words.",
    promptLine,
  ].join("\n");

  const sb = supabaseServerAdmin();
  const { error } = await sb.from("paper_challenges").insert({
    id: challengeId,
    session_id: body.data.sessionId,
    seed,
    instructions,
    expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "db_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    challenge: {
      id: challengeId,
      seed,
      instructions,
      expiresAt,
    },
  });
}
