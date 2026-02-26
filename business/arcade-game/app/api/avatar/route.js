import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase_admin";

// Creates a signed upload URL for an avatar image.
// Client uploads bytes to the signed URL, then uses the returned publicUrl.
export async function POST(req) {
  try {
    const body = await req.json();
    const { address, contentType } = body || {};

    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const supabase = supabaseAdmin();

    const bucket = "avatars";
    const filePath = `arcade/${address.toLowerCase()}.png`;

    // Ensure bucket exists (idempotent)
    // storage.create_bucket requires service role; ignore errors if already exists.
    await supabase.storage.createBucket(bucket, { public: true }).catch(() => null);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, { contentType: contentType || "image/png" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      bucket,
      filePath,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
