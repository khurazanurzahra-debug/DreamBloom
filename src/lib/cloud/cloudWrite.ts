import { supabase } from "./supabaseClient";
import { enqueuePendingWrite } from "./offlineQueue";

export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error";

interface CloudWriteOptions {
  table: string;
  op: "upsert" | "delete";
  payload: Record<string, unknown>;
  onStatus: (status: SyncStatus) => void;
}

/**
 * Fire-and-forget cloud write used by every DreamContext CRUD action. The caller has
 * already applied the optimistic local state update before calling this — on failure we
 * never revert that (the user's input is never lost), we just queue the write for retry
 * and surface a status the UI can show subtly.
 */
export async function cloudWrite({ table, op, payload, onStatus }: CloudWriteOptions): Promise<void> {
  if (!supabase) return;
  onStatus("saving");
  try {
    const query =
      op === "upsert"
        ? supabase.from(table).upsert(payload)
        : supabase.from(table).delete().eq("id", payload.id as string);
    const { error } = await query;
    if (error) throw error;
    onStatus("saved");
  } catch {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    enqueuePendingWrite({ table, op, payload });
    onStatus(offline ? "offline" : "error");
  }
}
