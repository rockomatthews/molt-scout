import "dotenv/config";

export type Cast = {
  hash: string;
  text: string;
  author: { username: string; display_name?: string };
  timestamp: string;
  reactions?: { likes?: number; recasts?: number };
  replies?: { count?: number };
};

// Minimal wrapper. We'll refine endpoints once you provide a Neynar key and we confirm desired feeds.
export async function fetchTrendingCasts(limit = 20): Promise<Cast[]> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) throw new Error("NEYNAR_API_KEY missing");

  // Neynar has multiple endpoints; the exact one can vary by plan/version.
  // We start with a safe pattern and will adjust based on actual response.
  const url = new URL("https://api.neynar.com/v2/farcaster/feed/trending");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      api_key: apiKey,
    },
  });
  if (!res.ok) throw new Error(`neynar trending failed: ${res.status} ${await res.text()}`);
  const json = await res.json();

  // Normalize common shapes: { casts: [...] } or { feed: [{ cast: {...}}] }
  const casts: Cast[] = [];
  if (Array.isArray(json.casts)) {
    for (const c of json.casts) casts.push(c);
  } else if (Array.isArray(json.feed)) {
    for (const item of json.feed) if (item.cast) casts.push(item.cast);
  }
  return casts;
}
