import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseConfigState } from "./config";
export { getSupabaseConfigState } from "./config";

export function createSupabaseAdminClient() {
  const config = getSupabaseConfigState();
  if (config.status !== "configured")
    throw new Error(
      "Reuse the existing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) on the server.",
    );
  return createClient<Database>(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
