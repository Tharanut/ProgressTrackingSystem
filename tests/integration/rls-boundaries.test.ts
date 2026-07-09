import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import {
  cleanupTestProject,
  createTestProject,
  createTestTask,
  SEED_USER_ID,
  signIn,
} from "./helpers";

/**
 * RLS UPDATE/DELETE policies filter non-matching rows silently (0 rows affected, no error) —
 * unlike INSERT's WITH CHECK, which raises 42501. Every write path in this app must be tested
 * against both behaviors; see CLAUDE.md and .claude/agents/security-auditor.md.
 */
describe("RLS role boundaries", () => {
  let admin: SupabaseClient<Database>;
  let pm: SupabaseClient<Database>;
  let wichai: SupabaseClient<Database>;
  let projectId: string;
  let ownTaskId: string;
  let otherTaskId: string;

  beforeAll(async () => {
    // Sign in once per role and reuse — Supabase Auth rate-limits sign-ins per IP.
    admin = await signIn("admin");
    pm = await signIn("somchai");
    wichai = await signIn("wichai");
  });

  beforeEach(async () => {
    const project = await createTestProject(admin);
    const ownTask = await createTestTask(admin, project.id, { assigned_to: SEED_USER_ID.member1 });
    const otherTask = await createTestTask(admin, project.id, {
      assigned_to: SEED_USER_ID.member2,
    });
    projectId = project.id;
    ownTaskId = ownTask.id;
    otherTaskId = otherTask.id;
  });

  afterEach(async () => {
    await cleanupTestProject(admin, projectId);
  });

  it("allows a member to update progress on a task assigned to them", async () => {
    const { data, error } = await wichai
      .from("tasks")
      .update({ progress_percent: 100 })
      .eq("id", ownTaskId)
      .select("id");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("silently affects 0 rows (no error) when a member updates a task assigned to someone else", async () => {
    const { data, error } = await wichai
      .from("tasks")
      .update({ progress_percent: 99 })
      .eq("id", otherTaskId)
      .select("id");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("allows pm to update any task in the project", async () => {
    const { data, error } = await pm
      .from("tasks")
      .update({ progress_percent: 42 })
      .eq("id", otherTaskId)
      .select("id");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("rejects a member creating a project outright (INSERT raises, does not silently no-op)", async () => {
    const { error } = await wichai
      .from("projects")
      .insert({ project_code: "SHOULD-NOT-EXIST", project_name: "blocked" });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("lets a member insert their own time_log but blocks inserting one for someone else", async () => {
    const own = await wichai.from("time_logs").insert({
      project_id: projectId,
      task_id: ownTaskId,
      user_id: SEED_USER_ID.member1,
      work_date: "2026-07-20",
      work_hour: 4,
    });
    expect(own.error).toBeNull();

    const forged = await wichai.from("time_logs").insert({
      project_id: projectId,
      task_id: otherTaskId,
      user_id: SEED_USER_ID.member2, // impersonating nara
      work_date: "2026-07-20",
      work_hour: 4,
    });
    expect(forged.error).not.toBeNull();
    expect(forged.error?.code).toBe("42501");
  });

  it("rejects an activity_logs insert with a forged changed_by (impersonation)", async () => {
    const { error } = await wichai.from("activity_logs").insert({
      entity_type: "project",
      entity_id: projectId,
      action: "update",
      changed_by: SEED_USER_ID.admin, // pretending to be admin
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });
});
