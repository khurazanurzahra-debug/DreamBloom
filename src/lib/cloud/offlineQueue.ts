import { supabase } from "./supabaseClient";

// A deliberately minimal offline queue: enough to never lose a user's input while
// offline and to retry automatically once the connection is back, without building a
// full conflict-resolution system. Each entry is a single upsert/delete already mapped
// to its row shape, so replaying it is just re-running the same Supabase call.

const QUEUE_KEY = "dreambloom_pending_sync";

interface QueuedWrite {
  table: string;
  op: "upsert" | "delete";
  payload: Record<string, unknown> | { id: string };
}

function readQueue(): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedWrite[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

export function enqueuePendingWrite(entry: QueuedWrite) {
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
}

export function hasPendingWrites(): boolean {
  return readQueue().length > 0;
}

// Guards against the browser firing multiple 'online' events in quick succession (a
// real thing on flaky connections) triggering two concurrent flushes that would both
// read the same queue and race to replay the same first entry.
let isFlushing = false;

/** Replays queued writes in order. Stops at the first failure and keeps the remainder
 * queued, rather than skipping ahead — a later write can depend on an earlier one
 * (e.g. a category must exist before a transaction referencing it). Every entry is
 * upsert-by-id or delete-by-id, so even if the same entry were ever replayed twice
 * (e.g. after an interrupted flush), re-applying it is a no-op, not a duplicate. */
export async function flushPendingWrites(): Promise<{ flushed: number; remaining: number }> {
  if (!supabase) return { flushed: 0, remaining: 0 };
  if (isFlushing) return { flushed: 0, remaining: readQueue().length };
  isFlushing = true;

  try {
    const queue = readQueue();
    let flushed = 0;

    while (queue.length > 0) {
      const entry = queue[0];
      const query =
        entry.op === "upsert"
          ? supabase.from(entry.table).upsert(entry.payload)
          : supabase.from(entry.table).delete().eq("id", (entry.payload as { id: string }).id);
      const { error } = await query;
      if (error) break;
      queue.shift();
      flushed += 1;
      // Persist after every successful entry, not just at the end — if the tab closes
      // mid-flush, already-confirmed writes are never replayed again on next load.
      writeQueue(queue);
    }

    return { flushed, remaining: queue.length };
  } finally {
    isFlushing = false;
  }
}
