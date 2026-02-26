import { supabaseClient } from "../../lib/supabase";

export function emptyOwners() {
  return Array.from({ length: 100 }).map(() => null);
}

export async function loadState() {
  const supabase = supabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("arc_game_state").select("*").eq("id", "global").single();
  if (error) throw error;
  return data;
}

export async function saveState(next) {
  const supabase = supabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("arc_game_state")
    .update({
      crown_idx: next.crown_idx,
      round_ends_at: next.round_ends_at,
      tiles: next.tiles,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "global")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
