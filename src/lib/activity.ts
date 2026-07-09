import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/database.types";

type ActivityAction = Database["public"]["Enums"]["activity_action"];

/**
 * Records an audit trail entry for a create/update/delete on a core entity.
 * `changed_by` must equal the caller's auth uid (enforced by RLS on activity_logs).
 */
export async function logActivity(
  supabase: SupabaseClient<Database>,
  params: {
    entityType: string;
    entityId: string;
    action: ActivityAction;
    oldValue?: Json | null;
    newValue?: Json | null;
  },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_logs").insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    old_value: params.oldValue ?? null,
    new_value: params.newValue ?? null,
    changed_by: user.id,
  });
}
