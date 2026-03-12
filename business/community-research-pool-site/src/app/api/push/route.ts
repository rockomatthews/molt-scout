import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { supabaseAdmin } from "../_supabase_admin";

export const runtime = "nodejs";

const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const FindingSchema = z.object({
  finding: z.string().min(10).max(2000),
  confidence: z.enum(["low", "med", "high"]),
  why: z.string().min(10).max(2000),
  sourceUrls: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).optional(),
});

const BodySchema = z
  .object({
    topicSlug: z.literal("cure-cancer"),
    runDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contributorId: z.string().min(3).max(80),
    durationMinutes: z.number().int().min(10).max(180).optional(),
    summary: z.string().min(20).max(8000),
    sources: z.array(SourceSchema).default([]),
    findings: z.array(FindingSchema).min(1).max(30),
    openQuestions: z.array(z.string().min(5).max(400)).default([]),
    failedPaths: z.array(z.string().min(5).max(500)).default([]),
  })
  .strict();

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function POST(req: Request) {
  const expected = process.env.CRP_WRITE_TOKEN;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: "CRP_WRITE_TOKEN" }, { status: 500 });
  }

  const got = req.headers.get("authorization") || "";
  const token = got.startsWith("Bearer ") ? got.slice("Bearer ".length) : got;
  if (!token || token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request", detail: body.error.flatten() }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  const {
    topicSlug,
    runDate,
    contributorId,
    durationMinutes,
    summary,
    sources,
    findings,
    openQuestions,
    failedPaths,
  } = body.data;

  // Anti-spam MVP: only 1 run per contributor per date.
  const existing = await sb
    .from("crp_runs")
    .select("id")
    .eq("topic_slug", topicSlug)
    .eq("run_date", runDate)
    .eq("contributor_id", contributorId)
    .maybeSingle();

  if (existing.data?.id) {
    return NextResponse.json({ ok: false, error: "already_submitted" }, { status: 409 });
  }

  const runId = newId("run");

  // Upsert sources by (topic_slug, url_hash)
  const urlToSourceId = new Map<string, string>();

  for (const s of sources) {
    const urlHash = sha256Hex(s.url.trim());

    // try existing
    const found = await sb
      .from("crp_sources")
      .select("id")
      .eq("topic_slug", topicSlug)
      .eq("url_hash", urlHash)
      .maybeSingle();

    if (found.data?.id) {
      urlToSourceId.set(s.url, found.data.id);
      continue;
    }

    const sid = newId("src");
    const ins = await sb.from("crp_sources").insert({
      id: sid,
      topic_slug: topicSlug,
      url: s.url,
      url_hash: urlHash,
      title: s.title || null,
      published_at: s.publishedAt || null,
      meta: {},
    });

    if (ins.error) {
      // race: if unique conflict, re-fetch
      const refetch = await sb
        .from("crp_sources")
        .select("id")
        .eq("topic_slug", topicSlug)
        .eq("url_hash", urlHash)
        .maybeSingle();
      if (refetch.data?.id) {
        urlToSourceId.set(s.url, refetch.data.id);
        continue;
      }
      return NextResponse.json({ ok: false, error: "db_insert_failed", detail: ins.error.message }, { status: 500 });
    }

    urlToSourceId.set(s.url, sid);
  }

  // Ensure any URLs referenced in findings exist as sources.
  for (const f of findings) {
    for (const u of f.sourceUrls) {
      if (urlToSourceId.has(u)) continue;
      const urlHash = sha256Hex(u.trim());
      const found = await sb
        .from("crp_sources")
        .select("id")
        .eq("topic_slug", topicSlug)
        .eq("url_hash", urlHash)
        .maybeSingle();
      if (found.data?.id) {
        urlToSourceId.set(u, found.data.id);
        continue;
      }
      const sid = newId("src");
      const ins = await sb.from("crp_sources").insert({
        id: sid,
        topic_slug: topicSlug,
        url: u,
        url_hash: urlHash,
        title: null,
        published_at: null,
        meta: {},
      });
      if (ins.error) {
        return NextResponse.json({ ok: false, error: "db_insert_failed", detail: ins.error.message }, { status: 500 });
      }
      urlToSourceId.set(u, sid);
    }
  }

  // Insert run
  const runIns = await sb.from("crp_runs").insert({
    id: runId,
    topic_slug: topicSlug,
    run_date: runDate,
    contributor_id: contributorId,
    duration_minutes: durationMinutes ?? 60,
    summary,
    meta: {},
  });

  if (runIns.error) {
    return NextResponse.json({ ok: false, error: "db_insert_failed", detail: runIns.error.message }, { status: 500 });
  }

  // Insert findings
  for (const f of findings) {
    const fid = newId("fdg");
    const sourceIds = f.sourceUrls.map((u) => urlToSourceId.get(u)!).filter(Boolean);

    if (!sourceIds.length) {
      return NextResponse.json({ ok: false, error: "missing_sources" }, { status: 400 });
    }

    const finIns = await sb.from("crp_findings").insert({
      id: fid,
      topic_slug: topicSlug,
      run_id: runId,
      finding: f.finding,
      confidence: f.confidence,
      why: f.why,
      source_ids: sourceIds,
      tags: f.tags || [],
    });

    if (finIns.error) {
      return NextResponse.json({ ok: false, error: "db_insert_failed", detail: finIns.error.message }, { status: 500 });
    }
  }

  // Insert open questions
  for (const q of openQuestions) {
    const qid = newId("oq");
    const qIns = await sb.from("crp_open_questions").insert({
      id: qid,
      topic_slug: topicSlug,
      run_id: runId,
      question: q,
    });
    if (qIns.error) {
      return NextResponse.json({ ok: false, error: "db_insert_failed", detail: qIns.error.message }, { status: 500 });
    }
  }

  // Insert failed paths
  for (const note of failedPaths) {
    const pid = newId("fp");
    const pIns = await sb.from("crp_failed_paths").insert({
      id: pid,
      topic_slug: topicSlug,
      run_id: runId,
      note,
    });
    if (pIns.error) {
      return NextResponse.json({ ok: false, error: "db_insert_failed", detail: pIns.error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, runId });
}
