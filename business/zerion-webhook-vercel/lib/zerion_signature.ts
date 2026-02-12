import crypto from 'node:crypto';

let cachedCert: { url: string; pem: string; fetchedAtMs: number } | null = null;

async function fetchCertPem(url: string): Promise<string> {
  // Simple cache (5 minutes) to reduce repeated downloads
  const now = Date.now();
  if (cachedCert && cachedCert.url === url && now - cachedCert.fetchedAtMs < 5 * 60_000) return cachedCert.pem;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`cert fetch failed: ${res.status}`);
  const pem = await res.text();
  cachedCert = { url, pem, fetchedAtMs: now };
  return pem;
}

export async function verifyZerionSignature(opts: {
  signatureB64: string;
  timestamp: string;
  certUrl: string;
  rawBody: string;
}): Promise<boolean> {
  const pem = await fetchCertPem(opts.certUrl);
  const message = `${opts.timestamp}\n${opts.rawBody}\n`;

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(message);
  verifier.end();

  const sig = Buffer.from(opts.signatureB64, 'base64');
  return verifier.verify(pem, sig);
}
