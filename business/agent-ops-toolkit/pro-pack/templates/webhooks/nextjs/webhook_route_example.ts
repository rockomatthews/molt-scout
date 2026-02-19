/**
 * Example Next.js Route Handler for webhooks.
 *
 * Patterns:
 * - read raw body
 * - verify signature (HMAC)
 * - enforce timestamp tolerance
 * - idempotency
 */

import crypto from "node:crypto";

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export function verifyHmac({
  secret,
  rawBody,
  signature,
}: {
  secret: string;
  rawBody: string;
  signature: string;
}): VerifyResult {
  const mac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return { ok: false, reason: "bad signature length" };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, reason: "bad signature" };
  return { ok: true };
}
