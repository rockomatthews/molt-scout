import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { verifyZerionSignature } from '../../../lib/zerion_signature';

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

  // Zerion signature verification (per docs):
  // message = X-Timestamp + "\n" + request.body + "\n"
  // verify X-Signature using certificate at X-Certificate-URL
  if (process.env.ZERION_VERIFY_SIGNATURE === 'true') {
    const sig = req.headers.get('x-signature');
    const ts = req.headers.get('x-timestamp');
    const certUrl = req.headers.get('x-certificate-url');
    if (!sig || !ts || !certUrl) {
      return NextResponse.json({ ok: false, error: 'missing signature headers' }, { status: 401 });
    }

    const ok = await verifyZerionSignature({ signatureB64: sig, timestamp: ts, certUrl, rawBody: raw });
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
    }
  }

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
