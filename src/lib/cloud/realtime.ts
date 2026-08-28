import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

/**
 * Subscribes to changes on one table, scoped to one household. Returns an unsubscribe
 * function — always call it on unmount/household change so listeners never pile up.
 * One channel per (table, household) pair; never call this twice for the same pair
 * without unsubscribing the first one in between.
 */
export function subscribeToTable<Row extends Record<string, unknown>>(
  table: string,
  householdId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Row>) => void
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`${table}:${householdId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter: `household_id=eq.${householdId}` },
      onChange
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}
