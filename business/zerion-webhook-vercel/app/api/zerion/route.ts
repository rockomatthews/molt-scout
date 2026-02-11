import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, name: 'zerion-webhook' });
}

export async function POST(req: Request) {
  const raw = await req.text();
  let body: any = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = { _raw: raw.slice(0, 20000) };
  }

  // TODO: Verify webhook signature if/when Zerion provides one.

  const supabase = getSupabaseAdmin();

  const payload = {
    received_at: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries()),
    body,
  };

  const { error } = await supabase.from('zerion_webhook_events').insert(payload);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
