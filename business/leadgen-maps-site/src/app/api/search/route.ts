import { NextResponse } from "next/server";

function envKey() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GPLACES_API_KEY;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return await res.json();
}

export async function GET(req: Request) {
  const apiKey = envKey();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "missing_google_places_api_key", hint: "Set GOOGLE_PLACES_API_KEY in Vercel env." },
      { status: 500 }
    );
  }

  const u = new URL(req.url);
  const query = u.searchParams.get("query") || "";
  const limit = Math.max(1, Math.min(50, Number(u.searchParams.get("limit") || 20)));

  if (!query.trim()) {
    return NextResponse.json({ ok: false, error: "missing_query" }, { status: 400 });
  }

  // 1) Text search
  const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
  const first = await fetchJson(textUrl);
  const results: any[] = Array.isArray(first?.results) ? first.results : [];

  const picks = results.slice(0, limit);

  // 2) Details per place (website/phone)
  const leads: any[] = [];
  for (const r of picks) {
    const placeId = r?.place_id;
    if (!placeId) continue;

    const fields = [
      "name",
      "formatted_address",
      "formatted_phone_number",
      "website",
      "rating",
      "user_ratings_total",
      "types",
      "url",
    ].join(",");

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(apiKey)}`;

    let d: any;
    try {
      d = await fetchJson(detailsUrl);
    } catch {
      continue;
    }

    const p = d?.result;
    if (!p?.name) continue;

    leads.push({
      name: p.name,
      website: p.website || "",
      phone: p.formatted_phone_number || "",
      address: p.formatted_address || "",
      rating: p.rating ?? "",
      reviews: p.user_ratings_total ?? "",
      categories: Array.isArray(p.types) ? p.types.join("|") : "",
      mapsUrl: p.url || "",
    });

    if (leads.length >= limit) break;
  }

  return NextResponse.json({ ok: true, query, generatedAt: new Date().toISOString(), leads });
}
