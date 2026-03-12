import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "../_supabase_admin";

export const runtime = "nodejs";

const QuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = QuerySchema.safeParse({ date: url.searchParams.get("date") || undefined });
  if (!q.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const runDate = q.data.date ?? isoDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let sb;
  try {
    sb = supabaseAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  const runsRes = await sb
    .from("crp_runs")
    .select("id, run_date, contributor_id, duration_minutes, summary, created_at")
    .eq("topic_slug", "cure-cancer")
    .eq("run_date", runDate)
    .order("created_at", { ascending: false })
    .limit(100);

  if (runsRes.error) {
    return NextResponse.json({ ok: false, error: "db_read_failed", detail: runsRes.error.message }, { status: 500 });
  }

  const runIds = (runsRes.data || []).map((r) => r.id);

  const findingsRes = runIds.length
    ? await sb
        .from("crp_findings")
        .select("id, run_id, finding, confidence, why, source_ids, tags, created_at")
        .in("run_id", runIds)
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [], error: null as any };

  if (findingsRes.error) {
    return NextResponse.json({ ok: false, error: "db_read_failed", detail: findingsRes.error.message }, { status: 500 });
  }

  // Collect source ids referenced by findings
  const sourceIds = new Set<string>();
  for (const f of findingsRes.data || []) {
    for (const sid of (f as any).source_ids || []) sourceIds.add(sid);
  }

  const sourcesRes = sourceIds.size
    ? await sb
        .from("crp_sources")
        .select("id, url, title, published_at, meta")
        .in("id", Array.from(sourceIds))
    : { data: [], error: null as any };

  if (sourcesRes.error) {
    return NextResponse.json({ ok: false, error: "db_read_failed", detail: sourcesRes.error.message }, { status: 500 });
  }

  const openQRes = runIds.length
    ? await sb.from("crp_open_questions").select("run_id, question").in("run_id", runIds).limit(500)
    : { data: [], error: null as any };

  if ((openQRes as any).error) {
    return NextResponse.json({ ok: false, error: "db_read_failed", detail: (openQRes as any).error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    topicSlug: "cure-cancer",
    date: runDate,
    runs: runsRes.data || [],
    findings: findingsRes.data || [],
    sources: sourcesRes.data || [],
    openQuestions: (openQRes as any).data || [],
  });
}
