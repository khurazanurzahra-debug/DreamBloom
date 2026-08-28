import type { Category, Goal, Obligation, PersonProfile, Transaction } from "../../types";
import { supabase } from "./supabaseClient";
import { categoryToRow, goalToRow, obligationToRow, profileToRow, transactionToRow } from "./mappers";

// Guards the one-time upload so a returning session never re-checks/re-uploads once this
// device has already resolved whether migration was needed (either it uploaded, or it
// found the household already had data and correctly skipped). This is a fast-path
// optimization only — it is NEVER the thing that decides whether uploading is safe.
// That decision is made fresh, every time, from the actual state of the cloud household
// (see isHouseholdCloudEmpty below), because a per-device flag has no way of knowing
// whether some OTHER device already put real data in this household.
const MIGRATION_KEY = "dreambloom_cloud_migration_v1";

export function hasMigratedLocalData(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === "done";
  } catch {
    return false;
  }
}

function markMigrated() {
  try {
    localStorage.setItem(MIGRATION_KEY, "done");
  } catch {
    // ignore
  }
}

export interface LocalDataSnapshot {
  profiles: PersonProfile[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  obligations: Obligation[];
  sharedSavingTarget: number;
  goldTargetGrams: number;
  gratitudeText: string;
  buildingTogetherText: string;
}

/**
 * Checks whether this household already has any application-generated data in the
 * cloud. `profiles` is deliberately excluded — schema.sql's one-time setup seeds
 * Khuraza & Yusuf's profile rows for every household regardless of whether the app has
 * actually been used yet, so profile rows existing is not evidence of real usage.
 *
 * Returns:
 * - `true`  — household is genuinely empty of app data, a first migration may proceed.
 * - `false` — household already has data (from a previous migration OR real usage);
 *             migration must be skipped, no matter what.
 * - `null`  — the check itself failed (network/RLS/etc). Ambiguous. Callers must treat
 *             this the same as "has data" and refuse to migrate — fail closed.
 */
export async function isHouseholdCloudEmpty(householdId: string): Promise<boolean | null> {
  const client = supabase;
  if (!client) return null;

  const tables = ["categories", "transactions", "goals", "obligations"] as const;
  try {
    const results = await Promise.all(
      tables.map((table) =>
        client.from(table).select("id", { count: "exact", head: true }).eq("household_id", householdId)
      )
    );
    for (const result of results) {
      if (result.error) return null; // ambiguous — fail closed
      if ((result.count ?? 0) > 0) return false; // real data already present somewhere
    }
    return true;
  } catch {
    return null; // ambiguous — fail closed
  }
}

/**
 * Uploads whatever this device already had in localStorage — but ONLY the very first
 * time anyone connects a genuinely empty household to the cloud. Every other case
 * (household already has data, or the emptiness check couldn't be completed) refuses to
 * write anything and lets the caller fall through to a plain cloud fetch instead, so an
 * already-populated household is never touched by a second device's stale local seed
 * data.
 *
 * Order matters for the actual upload: categories and obligations are written before
 * transactions, since transactions reference them by id (foreign keys).
 */
export async function migrateLocalDataToCloud(
  householdId: string,
  snapshot: LocalDataSnapshot
): Promise<{ ok: boolean; migrated: boolean; error?: string }> {
  if (!supabase) return { ok: true, migrated: false };
  if (hasMigratedLocalData()) return { ok: true, migrated: false };

  const emptyCheck = await isHouseholdCloudEmpty(householdId);
  if (emptyCheck === null) {
    // Fail closed: we could not confirm the household is empty, so we do not risk
    // writing anything. Do NOT mark as migrated — this must be re-checked next time.
    return { ok: false, migrated: false, error: "Tidak bisa memastikan status cloud. Migrasi ditunda." };
  }
  if (emptyCheck === false) {
    // Household already has real data (from a previous migration or real usage).
    // Never upload local seed/stale data on top of it. Mark this device as resolved so
    // it stops re-checking on every future boot — the cloud is now this device's source
    // of truth going forward.
    markMigrated();
    return { ok: true, migrated: false };
  }

  try {
    if (snapshot.profiles.length) {
      const { error } = await supabase
        .from("profiles")
        .upsert(snapshot.profiles.map((p) => profileToRow(p, householdId)));
      if (error) throw error;
    }
    if (snapshot.categories.length) {
      const { error } = await supabase
        .from("categories")
        .upsert(snapshot.categories.map((c) => categoryToRow(c, householdId)));
      if (error) throw error;
    }
    if (snapshot.obligations.length) {
      const { error } = await supabase
        .from("obligations")
        .upsert(snapshot.obligations.map((o) => obligationToRow(o, householdId)));
      if (error) throw error;
    }
    if (snapshot.transactions.length) {
      const { error } = await supabase
        .from("transactions")
        .upsert(snapshot.transactions.map((t) => transactionToRow(t, householdId)));
      if (error) throw error;
    }
    if (snapshot.goals.length) {
      const { error } = await supabase.from("goals").upsert(snapshot.goals.map((g) => goalToRow(g, householdId)));
      if (error) throw error;
    }

    const { error: settingsError } = await supabase.from("household_settings").upsert({
      household_id: householdId,
      shared_saving_target: snapshot.sharedSavingTarget,
      gold_target_grams: snapshot.goldTargetGrams,
      gratitude_text: snapshot.gratitudeText || null,
      building_together_text: snapshot.buildingTogetherText || null,
    });
    if (settingsError) throw settingsError;

    markMigrated();
    return { ok: true, migrated: true };
  } catch (err) {
    // Upload failed partway. Deliberately NOT marking as migrated — a retry must be
    // allowed to re-attempt, and the emptiness check will simply run again next time.
    return { ok: false, migrated: false, error: err instanceof Error ? err.message : "Migrasi data lokal gagal." };
  }
}
