import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
    challengeId: z.string().min(5),
    artifact: z.string().min(10).max(5000),
  })
  .strict();

function dayMT() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseCategory(instructions: string): "trading" | "operator" | "security" {
  const m = instructions.match(/category:\s*(trading|operator|security)/i);
  const c = (m?.[1] || "trading").toLowerCase();
  return c === "operator" ? "operator" : c === "security" ? "security" : "trading";
}

function scoreArtifact(artifact: string, category: "trading" | "operator" | "security") {
  // MVP deterministic verifier:
  // - word count cap
  // - must include key words for the category
  const words = artifact.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const mustHaveByCategory: Record<typeof category, string[]> = {
    trading: ["entry", "exit", "risk", "fail"],
    operator: ["goal", "steps", "metric", "risk"],
    security: ["threat", "fix", "verify", "risk"],
  };

  const mustHave = mustHaveByCategory[category];
  const lower = artifact.toLowerCase();
  const hits = mustHave.filter((k) => lower.includes(k));

  const ok = wordCount <= 140 && hits.length >= 3;
  const points = ok ? 10 : 0;

  return { ok, points, wordCount, hits, category };
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { sessionId, challengeId, artifact } = body.data;

  const sb = supabaseServerAdmin();

  // Fetch challenge and validate ownership + expiry.
  const { data: ch, error: chErr } = await sb
    .from("paper_challenges")
    .select("id, session_id, seed, expires_at, instructions")
    .eq("id", challengeId)
    .maybeSingle();

  if (chErr || !ch) {
    return NextResponse.json({ ok: false, error: "challenge_not_found" }, { status: 404 });
  }

  if (ch.session_id !== sessionId) {
    return NextResponse.json({ ok: false, error: "challenge_session_mismatch" }, { status: 403 });
  }

  if (new Date(ch.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "challenge_expired" }, { status: 400 });
  }

  const category = parseCategory(String((ch as any).instructions || ""));
  const verdict = scoreArtifact(artifact, category);

  const submissionId = `sub_${crypto.randomUUID().replace(/-/g, "")}`;

  const { error: subErr } = await sb.from("paper_submissions").insert({
    id: submissionId,
    challenge_id: challengeId,
    session_id: sessionId,
    artifact,
    points: verdict.points,
    verdict: verdict.ok ? "ok" : "rejected",
    meta: {
      category: verdict.category,
      wordCount: verdict.wordCount,
      hits: verdict.hits,
    },
  });

  if (subErr) {
    return NextResponse.json({ ok: false, error: "db_insert_failed" }, { status: 500 });
  }

  // Streak multiplier (reset to 0 on wrong). Best-effort if state table not present.
  let awardedPoints = verdict.points;
  let streak = 0;

  try {
    const today = dayMT();
    const { data: st } = await sb
      .from("paper_session_state")
      .select("session_id, streak, day, submissions_total, submissions_ok")
      .eq("session_id", sessionId)
      .maybeSingle();

    const sameDay = String(st?.day || "") === today;
    const prevStreak = Number(st?.streak || 0);
    const nextStreak = verdict.ok ? prevStreak + 1 : 0;

    // multiplier = min(1 + 0.1*streak, 3.0)
    const mult = Math.min(1 + 0.1 * nextStreak, 3.0);
    awardedPoints = verdict.ok ? Math.round(10 * mult) : 0;
    streak = nextStreak;

    await sb
      .from("paper_session_state")
      .upsert(
        {
          session_id: sessionId,
          day: today,
          streak: nextStreak,
          last_ok_at: verdict.ok ? new Date().toISOString() : (st as any)?.last_ok_at ?? null,
          submissions_total: (sameDay ? Number(st?.submissions_total || 0) : 0) + 1,
          submissions_ok: (sameDay ? Number(st?.submissions_ok || 0) : 0) + (verdict.ok ? 1 : 0),
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "session_id" },
      );
  } catch {
    // ignore
  }

  // Update balance (simple accumulator).
  if (awardedPoints > 0) {
    await sb.rpc("paper_add_points", {
      p_session_id: sessionId,
      p_points: awardedPoints,
    });
  }

  return NextResponse.json({
    ok: true,
    submission: {
      id: submissionId,
      points: awardedPoints,
      verdict: verdict.ok ? "ok" : "rejected",
      details: {
        category: verdict.category,
        streak,
        wordCount: verdict.wordCount,
        hits: verdict.hits,
      },
    },
  });
}
