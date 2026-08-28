import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase's newer client-safe key naming — same role as the old "anon" key (safe to
// ship in a frontend bundle), never the secret/service_role key.
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && publishableKey);

// When env vars are absent (no Supabase project set up yet), this stays null and every
// cloud code path in DreamContext no-ops, falling back to the original localStorage-only
// behavior. This is what keeps `npm run dev` working without any credentials.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, publishableKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
