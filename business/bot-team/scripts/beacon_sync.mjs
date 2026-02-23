import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_URL = process.env.CLAW_BEACON_API_URL;
const API_KEY = process.env.CLAW_BEACON_API_KEY;

if (!API_URL) {
  console.error("Missing CLAW_BEACON_API_URL");
  process.exit(1);
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseQueue(md) {
  // Very simple parser:
  // Sections start with: ## YYYY-MM-DD — Candidate #N ...
  // Then bullet lines (- **Name:** ... etc)
  const lines = md.split(/\r?\n/);
  const items = [];
  let cur = null;

  for (const line of lines) {
    const m = line.match(/^##\s+(\d{4}-\d{2}-\d{2})\s+—\s+Candidate\s+#(\d+)(.*)$/);
    if (m) {
      if (cur) items.push(cur);
      cur = {
        date: m[1],
        n: Number(m[2]),
        titleSuffix: (m[3] || "").trim(),
        fields: {},
        raw: [],
      };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("## ")) continue;
    cur.raw.push(line);

    const fm = line.match(/^\-\s+\*\*(.+?):\*\*\s+(.*)$/);
    if (fm) cur.fields[fm[1].toLowerCase()] = fm[2].trim();
  }
  if (cur) items.push(cur);

  return items
    .map((it) => {
      const name = it.fields.name || `Candidate #${it.n}`;
      const category = it.fields.category || "";
      const why = it.fields["why it could work"] || it.fields.why || "";
      const firstTest = it.fields["first test (48h)"] || it.fields["first test"] || "";
      const monetization = it.fields.monetization || it.fields.pricing || "";

      const heading = `${it.date} — #${it.n}: ${name}`;
      const description = [
        category ? `Category: ${category}` : null,
        monetization ? `Monetization: ${monetization}` : null,
        why ? `Why: ${why}` : null,
        firstTest ? `First test: ${firstTest}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const externalId = `queue:${it.date}:candidate:${it.n}:${sha1(name).slice(0, 8)}`;

      return {
        externalId,
        heading,
        name,
        description,
        date: it.date,
        n: it.n,
      };
    })
    .filter((x) => x.name);
}

async function http(method, url, body) {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status} ${res.statusText}\n${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

async function listTasks() {
  return http("GET", `${API_URL.replace(/\/$/, "")}/api/tasks`);
}

async function createTask(payload) {
  return http("POST", `${API_URL.replace(/\/$/, "")}/api/tasks`, payload);
}

async function updateTask(id, payload) {
  return http("PUT", `${API_URL.replace(/\/$/, "")}/api/tasks/${id}`, payload);
}

function indexByExternalId(tasks) {
  const m = new Map();
  for (const t of tasks || []) {
    if (t.externalId) m.set(t.externalId, t);
  }
  return m;
}

async function main() {
  const repoRoot = path.resolve(process.cwd(), "../..");
  const queuePath = path.join(repoRoot, "business", "bot-team-site", "content", "QUEUE.md");

  if (!fs.existsSync(queuePath)) {
    console.error(`Queue not found: ${queuePath}`);
    process.exit(1);
  }

  const md = read(queuePath);
  const queueItems = parseQueue(md);

  console.log(`Queue items: ${queueItems.length}`);

  const existing = await listTasks();
  const byExt = indexByExternalId(existing);

  let created = 0;
  let updated = 0;

  for (const it of queueItems) {
    const payload = {
      title: it.heading,
      description: it.description,
      status: "backlog",
      externalId: it.externalId,
      tags: ["queue", `candidate-${it.n}`, it.date],
    };

    const ex = byExt.get(it.externalId);
    if (!ex) {
      await createTask(payload);
      created++;
    } else {
      // update if title/description drift
      const needs = ex.title !== payload.title || ex.description !== payload.description;
      if (needs) {
        await updateTask(ex.id, { title: payload.title, description: payload.description, tags: payload.tags });
        updated++;
      }
    }
  }

  console.log(`Done. created=${created} updated=${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
