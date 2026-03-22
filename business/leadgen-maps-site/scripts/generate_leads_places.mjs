#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GPLACES_API_KEY;
if (!apiKey) {
  console.error("Missing GOOGLE_PLACES_API_KEY (or GPLACES_API_KEY)");
  process.exit(1);
}

const query = arg("--query", "Roofers in Denver, CO");
const limit = Number(arg("--limit", "40"));

const OUT_DIR = path.resolve(process.cwd(), "public", "leads");
const outJson = path.join(OUT_DIR, "latest.json");
const outCsv = path.join(OUT_DIR, "latest.csv");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return await res.json();
}

function csvEscape(s) {
  const v = String(s ?? "");
  if (/[\n\r,\"]/g.test(v)) return `"${v.replace(/\"/g, '""')}"`;
  return v;
}

// 1) Text search
const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
const first = await fetchJson(textUrl);
const results = Array.isArray(first?.results) ? first.results : [];

const picks = results.slice(0, Math.max(limit, 1));

// 2) Details per place (website/phone)
const leads = [];
for (const r of picks) {
  const placeId = r?.place_id;
  if (!placeId) continue;

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(
    [
      "name",
      "formatted_address",
      "formatted_phone_number",
      "website",
      "rating",
      "user_ratings_total",
      "types",
      "url",
    ].join(",")
  )}&key=${encodeURIComponent(apiKey)}`;

  let d;
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

await fs.mkdir(OUT_DIR, { recursive: true });

await fs.writeFile(
  outJson,
  JSON.stringify(
    {
      query,
      generatedAt: new Date().toISOString(),
      leads,
    },
    null,
    2
  ),
  "utf8"
);

const header = ["name", "website", "phone", "address", "rating", "reviews", "categories", "mapsUrl"];
const rows = [header.join(",")];
for (const l of leads) {
  rows.push(header.map((k) => csvEscape(l[k])).join(","));
}
await fs.writeFile(outCsv, rows.join("\n") + "\n", "utf8");

console.log(`wrote ${outJson} (${leads.length} leads)`);
console.log(`wrote ${outCsv}`);
