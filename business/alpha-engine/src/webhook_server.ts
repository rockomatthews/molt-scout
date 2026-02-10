import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd());

const PORT = Number(process.env.WEBHOOK_PORT || 3333);
const PATHNAME = process.env.ZERION_WEBHOOK_PATH || "/zerion-webhook";

async function append(kind: string, obj: unknown) {
  const p = path.join(ROOT, "logs", `${kind}.jsonl`);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + "\n", "utf8");
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      return res.end("missing url");
    }
    const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && u.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true, path: PATHNAME }));
    }

    if (req.method === "POST" && u.pathname === PATHNAME) {
      const raw = await readBody(req);
      let json: any = null;
      try {
        json = JSON.parse(raw.toString("utf8"));
      } catch {
        // keep raw only
      }

      // NOTE: signature verification depends on Zerion webhook spec; implement once confirmed.
      await append("zerion_webhooks", {
        kind: "webhook",
        ip: req.socket.remoteAddress,
        headers: req.headers,
        body: json ?? { raw: raw.toString("utf8").slice(0, 20000) },
      });

      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    }

    res.writeHead(404);
    return res.end("not found");
  } catch (err: any) {
    await append("zerion_webhooks", { kind: "error", message: String(err?.message || err) });
    res.writeHead(500);
    return res.end("error");
  }
});

server.listen(PORT, "0.0.0.0", async () => {
  await append("zerion_webhooks", { kind: "server_start", port: PORT, path: PATHNAME });
  // eslint-disable-next-line no-console
  console.log(`Zerion webhook server listening on http://0.0.0.0:${PORT}${PATHNAME}`);
});
