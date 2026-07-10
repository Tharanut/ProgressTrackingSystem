import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client for admin-only operations (e.g. `auth.admin.createUser`).
 * Server-only — `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix so Next.js never
 * bundles it to the browser. Never import this file from a "use client" component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
