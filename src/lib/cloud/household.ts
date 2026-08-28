import { supabase } from "./supabaseClient";

// Which household THIS device is connected to. Not financial data — just a local
// pointer/session concern (comparable to "which account am I logged into"), so it's fine
// to keep this in localStorage even though the actual financial data lives in the cloud.
const HOUSEHOLD_ID_KEY = "dreambloom_household_id";

export function getStoredHouseholdId(): string | null {
  try {
    return localStorage.getItem(HOUSEHOLD_ID_KEY);
  } catch {
    return null;
  }
}

function setStoredHouseholdId(id: string) {
  try {
    localStorage.setItem(HOUSEHOLD_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function clearStoredHouseholdId() {
  try {
    localStorage.removeItem(HOUSEHOLD_ID_KEY);
  } catch {
    // ignore
  }
}

/** Ensures this device has an authenticated (anonymous) Supabase session. No password,
 * no email, no UI — this is what lets Row Level Security tell "a real connected device"
 * apart from an anonymous internet visitor, without adding a login screen. */
export async function ensureSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  const { error } = await supabase.auth.signInAnonymously();
  return !error;
}

/** Verifies the given household id is still one this device's current session actually
 * belongs to (covers e.g. cleared browser storage keeping an old id around locally). */
export async function verifyHouseholdMembership(householdId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("household_id", householdId)
    .maybeSingle();
  return !error && Boolean(data);
}

export interface JoinHouseholdResult {
  ok: boolean;
  householdId?: string;
  error?: string;
}

/** The one-time "Connect Household" action: verifies the invite code server-side (via
 * the join_household RPC — the code itself is never checked or stored client-side) and,
 * on success, remembers the resulting household id on this device. */
export async function joinHouseholdWithInviteCode(inviteCode: string): Promise<JoinHouseholdResult> {
  if (!supabase) return { ok: false, error: "Cloud sync belum dikonfigurasi." };
  const signedIn = await ensureSession();
  if (!signedIn) return { ok: false, error: "Tidak bisa membuat sesi. Periksa koneksi internet." };

  const { data, error } = await supabase.rpc("join_household", { p_invite_code: inviteCode.trim() });
  if (error || !data) {
    return { ok: false, error: "Kode tidak valid. Periksa kembali kode yang diberikan." };
  }
  const householdId = data as string;
  setStoredHouseholdId(householdId);
  return { ok: true, householdId };
}
