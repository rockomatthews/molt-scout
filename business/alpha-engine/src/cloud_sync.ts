import { supabaseAdmin } from "./supabase.js";
import { loadConfig } from "./config.js";

export async function pullRemoteConfigIfPresent(root: string) {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("alpha_config").select("payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload) return null;
  return data.payload;
}

export async function pushStateSnapshot(state: any) {
  const sb = supabaseAdmin();

  // Attach latest polymarket loop (if present) so the hosted dashboard can show Polymarket first.
  let polymarketLoop: any = null;
  try {
    // dynamic import to avoid bundling issues
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(process.cwd());
    const p = path.join(root, "logs", "polymarket_loop.json");
    const raw = await fs.readFile(p, "utf8");
    polymarketLoop = JSON.parse(raw);
  } catch {
    // ignore
  }

  const payload = { ...state, polymarketLoop };
  const { error } = await sb.from("alpha_state_snapshots").insert({ payload });
  if (error) throw new Error(error.message);
}

export async function ensureRemoteConfigSeed(root: string) {
  const sb = supabaseAdmin();
  const cfg = await loadConfig(root);
  const { data, error } = await sb.from("alpha_config").select("payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.payload) return;
  await sb.from("alpha_config").insert({ id: 1, payload: cfg });
}
