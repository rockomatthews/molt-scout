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
  const payload = state;
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
