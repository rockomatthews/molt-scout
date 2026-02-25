import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

type CrMessage = {
  id: string;
  created_at: string;
  handle: string;
  body: string;
  user_id: string;
};

function env(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env ${name}`);
  return v;
}

function readMaybe(p: string, maxChars: number) {
  try {
    const s = fs.readFileSync(p, "utf8");
    return s.length > maxChars ? s.slice(0, maxChars) + "\n..." : s;
  } catch {
    return "";
  }
}

function latestMeetingSnippet(dir: string, maxChars: number) {
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse();
    if (!files.length) return "";
    return readMaybe(path.join(dir, files[0]), maxChars);
  } catch {
    return "";
  }
}

async function llmReply(input: {
  userHandle: string;
  message: string;
  queueMd: string;
  meetingMd: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "(Randy offline) Missing OPENAI_API_KEY on the responder.";
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = `You are Cyber Randy (@cyber_randy), the Bot Team's builder-brain.
You speak tersely, with strong opinions, and you propose concrete next steps.
You are currently working inside a repo that contains a public /queue and /meetings.
Rules:
- Reply in plain text.
- Be helpful and direct.
- If asked what you're building, summarize current priorities and 1-3 next actions.
- Don't mention private keys or secrets.
`;

  const context = `# Context: QUEUE.md\n${input.queueMd}\n\n# Context: latest meeting\n${input.meetingMd}`;

  const user = `Message from ${input.userHandle}:\n${input.message}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "system", content: context },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return `(Randy error) LLM call failed: ${res.status} ${text}`;
  }

  const json: any = await res.json();
  const out = json?.choices?.[0]?.message?.content;
  return typeof out === "string" && out.trim() ? out.trim() : "(Randy error) Empty reply.";
}

async function main() {
  const SUPABASE_URL = env("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
  const BOT_HANDLE = process.env.BOT_HANDLE || "@cyber_randy";
  const REQUIRE_STARRED = (process.env.REQUIRE_STARRED || "true") === "true";
  const REQUIRE_TAG = (process.env.REQUIRE_TAG || "true") === "true";
  const DRY_RUN = (process.env.DRY_RUN || "false") === "true";

  const queuePath = process.env.QUEUE_PATH || "../bot-team-site/content/QUEUE.md";
  const meetingsDir = process.env.MEETINGS_DIR || "../bot-team-site/content/meetings";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });

  console.log(`[randy] online. bot=${BOT_HANDLE} dryRun=${DRY_RUN}`);

  const channel = supabase
    .channel("cr_messages_inserts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "cr_messages" },
      async (payload) => {
        const msg = payload.new as CrMessage;
        try {
          // ignore our own messages
          if ((msg.handle || "").toLowerCase() === BOT_HANDLE.toLowerCase()) return;

          const body = msg.body || "";
          const tagged = body.toLowerCase().includes(BOT_HANDLE.toLowerCase());
          if (REQUIRE_TAG && !tagged) return;

          // idempotency: already replied?
          const { data: existing } = await supabase
            .from("cr_bot_replies")
            .select("message_id")
            .eq("message_id", msg.id)
            .maybeSingle();
          if (existing?.message_id) return;

          // trust gate
          if (REQUIRE_STARRED) {
            const { data: prof } = await supabase
              .from("cr_profiles")
              .select("id,handle,starred")
              .eq("id", msg.user_id)
              .single();
            if (!prof?.starred) return;
          }

          const queueMd = readMaybe(path.resolve(process.cwd(), queuePath), 6000);
          const meetingMd = latestMeetingSnippet(path.resolve(process.cwd(), meetingsDir), 6000);

          const reply = await llmReply({
            userHandle: msg.handle || "@user",
            message: body,
            queueMd,
            meetingMd,
          });

          console.log(`[randy] replying to ${msg.id} from ${msg.handle}: ${reply.slice(0, 80)}...`);

          if (DRY_RUN) return;

          const { data: inserted, error: insErr } = await supabase
            .from("cr_messages")
            .insert({
              user_id: msg.user_id,
              handle: BOT_HANDLE,
              body: reply,
            })
            .select("id")
            .single();
          if (insErr) throw insErr;

          const { error: mapErr } = await supabase
            .from("cr_bot_replies")
            .insert({ message_id: msg.id, reply_id: inserted.id });
          if (mapErr) throw mapErr;
        } catch (e: any) {
          console.error("[randy] error handling message", msg?.id, e?.message || e);
        }
      }
    )
    .subscribe((status) => {
      console.log("[randy] realtime status:", status);
    });

  // keep process alive
  process.on("SIGINT", async () => {
    console.log("[randy] shutting down");
    await supabase.removeChannel(channel);
    process.exit(0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
