import "dotenv/config";

// Zerion API wrapper placeholder.
// We'll plug this into the alpha-engine once we finish extracting wallet.xyz/pulse endpoints
// and have concrete wallet/token candidates to enrich.

export function hasZerionKey(): boolean {
  return Boolean(process.env.ZERION_API_KEY);
}

export async function zerionGet(path: string): Promise<unknown> {
  const key = process.env.ZERION_API_KEY;
  if (!key) throw new Error("ZERION_API_KEY missing");

  const url = new URL(path, "https://api.zerion.io");
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Basic ${Buffer.from(key + ':').toString('base64')}`,
    },
  });

  if (!res.ok) {
    throw new Error(`zerion GET ${url} failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}
