import fs from "node:fs";
import path from "node:path";

const API_URL = process.env.CLAW_BEACON_API_URL;
const API_KEY = process.env.CLAW_BEACON_API_KEY;

if (!API_URL) {
  console.error("Missing CLAW_BEACON_API_URL");
  process.exit(1);
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

function mdEscape(s) {
  return String(s || "").replace(/\r/g, "").trim();
}

function taskToCandidate(t) {
  // Prefer externalId tags (queue:candidate...) when present; otherwise still include.
  const title = mdEscape(t.title);
  const description = mdEscape(t.description);
  const status = (t.status || "backlog").toLowerCase();
  const tags = Array.isArray(t.tags) ? t.tags : [];

  const isQueue = tags.includes("queue") || (t.externalId || "").startsWith("queue:");

  return {
    id: t.id,
    title,
    description,
    status,
    tags,
    externalId: t.externalId || null,
    isQueue,
  };
}

function sectionTitleForStatus(status) {
  switch (status) {
    case "doing":
    case "in_progress":
    case "in-progress":
      return "IN PROGRESS";
    case "blocked":
      return "BLOCKED";
    case "done":
      return "DONE";
    case "backlog":
    default:
      return "BACKLOG";
  }
}

function renderQueueMd(tasks) {
  const items = (tasks || []).map(taskToCandidate).filter((x) => x.isQueue);

  // Order: doing, backlog, blocked, done. Then stable within section.
  const order = { doing: 0, backlog: 1, blocked: 2, done: 3 };

  items.sort((a, b) => {
    const ao = order[a.status] ?? 9;
    const bo = order[b.status] ?? 9;
    if (ao !== bo) return ao - bo;
    // Prefer candidates with externalId (derived from old queue headings)
    if (!!a.externalId !== !!b.externalId) return a.externalId ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const byStatus = new Map();
  for (const it of items) {
    const key = order[it.status] !== undefined ? it.status : "backlog";
    if (!byStatus.has(key)) byStatus.set(key, []);
    byStatus.get(key).push(it);
  }

  const sections = ["doing", "backlog", "blocked", "done"];

  let md = "# Opportunity Queue\n\n";
  md +=
    "**Canonical source of truth:** Claw Beacon (Mission Control). This file is auto-published from the kanban.\n\n";
  md += "Rules:\n";
  md += "- Work the kanban. This page will reflect it.\n";
  md += "- Keep tasks tagged `queue`.\n\n";

  for (const s of sections) {
    const arr = byStatus.get(s) || [];
    md += `## ${sectionTitleForStatus(s)}\n\n`;
    if (!arr.length) {
      md += "- (empty)\n\n";
      continue;
    }
    for (const t of arr) {
      md += `### ${t.title}\n`;
      md += `- **Beacon:** ${API_URL.replace(/\/$/, "")}/tasks/${t.id}\n`;
      if (t.description) {
        md += `\n${t.description}\n`;
      }
      md += "\n";
    }
  }

  md += "---\n\n";
  md += `Last published: ${new Date().toISOString()}\n`;

  return md;
}

async function main() {
  const repoRoot = path.resolve(process.cwd(), "../..");
  const queuePath = path.join(repoRoot, "business", "bot-team-site", "content", "QUEUE.md");

  const tasks = await listTasks();
  const md = renderQueueMd(tasks);

  fs.writeFileSync(queuePath, md);
  console.log(`Wrote ${queuePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
