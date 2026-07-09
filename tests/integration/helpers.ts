import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL_DOMAIN = process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN ?? "projectpulse.local";
const SEED_PASSWORD = "ProjectPulse#2026";

/** Seeded dev users (see Supabase migration 03) — id kept here for convenience in assertions. */
export const SEED_USER_ID = {
  admin: "a0000000-0000-0000-0000-000000000001",
  pm: "a0000000-0000-0000-0000-000000000002", // somchai
  member1: "a0000000-0000-0000-0000-000000000003", // wichai
  member2: "a0000000-0000-0000-0000-000000000004", // nara
} as const;

export type SeedUsername = "admin" | "somchai" | "wichai" | "nara";

/** Signs in as a seeded dev user. Requires NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (from .env.local). */
export async function signIn(username: SeedUsername): Promise<SupabaseClient<Database>> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — integration tests need .env.local",
    );
  }
  const sb = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await sb.auth.signInWithPassword({
    email: `${username}@${EMAIL_DOMAIN}`,
    password: SEED_PASSWORD,
  });
  if (error) throw new Error(`sign-in failed for ${username}: ${error.message}`);
  return sb;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** Creates a throwaway project (code prefixed TEST-) — always clean up with cleanupTestProject. */
export async function createTestProject(
  sb: SupabaseClient<Database>,
  overrides: Partial<Database["public"]["Tables"]["projects"]["Insert"]> = {},
) {
  const project_code = `TEST-${randomSuffix()}`;
  const { data, error } = await sb
    .from("projects")
    .insert({
      project_code,
      project_name: "Integration Test Project",
      planned_man_day: 10,
      ...overrides,
    })
    .select("*")
    .single();
  if (error) throw new Error(`createTestProject failed: ${error.message}`);
  return data;
}

export async function createTestTask(
  sb: SupabaseClient<Database>,
  projectId: string,
  overrides: Partial<Database["public"]["Tables"]["tasks"]["Insert"]> = {},
) {
  const { data, error } = await sb
    .from("tasks")
    .insert({
      project_id: projectId,
      task_name: "Integration Test Task",
      planned_man_day: 5,
      ...overrides,
    })
    .select("*")
    .single();
  if (error) throw new Error(`createTestTask failed: ${error.message}`);
  return data;
}

/** Deletes the project — cascades to project_members/tasks/time_logs/cost_logs via FK. */
export async function cleanupTestProject(sbAdmin: SupabaseClient<Database>, projectId: string) {
  await sbAdmin.from("projects").delete().eq("id", projectId);
}
