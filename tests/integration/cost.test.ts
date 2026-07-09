import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { cleanupTestProject, createTestProject, createTestTask, SEED_USER_ID, signIn } from "./helpers";

/**
 * cost_logs are derived 1:1 from time_logs by a DB trigger (migration `10`), snapshotting the
 * employee's cost_rate_per_day at creation time (docs/spec.md §9.3) — later rate changes must
 * never retroactively change historical cost_logs.
 */
describe("Cost calculation & rate snapshotting (docs/spec.md §9.3)", () => {
  let admin: SupabaseClient<Database>;
  let wichai: SupabaseClient<Database>;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    admin = await signIn("admin");
    wichai = await signIn("wichai");
  });

  beforeEach(async () => {
    const project = await createTestProject(admin, { planned_man_day: 4 });
    const task = await createTestTask(admin, project.id, { planned_man_day: 4 });
    projectId = project.id;
    taskId = task.id;
  });

  afterEach(async () => {
    await cleanupTestProject(admin, projectId);
  });

  it("creates a cost_log snapshotting the employee's current cost_rate_per_day", async () => {
    const { data: profile } = await admin
      .from("profiles")
      .select("cost_rate_per_day")
      .eq("id", SEED_USER_ID.member1)
      .single();
    const currentRate = Number(profile?.cost_rate_per_day);

    const { data: log } = await wichai
      .from("time_logs")
      .insert({
        project_id: projectId,
        task_id: taskId,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-20",
        work_hour: 8,
      })
      .select("id")
      .single();

    const { data: costLog } = await admin
      .from("cost_logs")
      .select("man_day, cost_rate_per_day, total_cost")
      .eq("time_log_id", log!.id)
      .single();

    expect(Number(costLog?.man_day)).toBe(1);
    expect(Number(costLog?.cost_rate_per_day)).toBe(currentRate);
    expect(Number(costLog?.total_cost)).toBe(1 * currentRate);

    const { data: project } = await admin.from("projects").select("actual_cost").eq("id", projectId).single();
    expect(Number(project?.actual_cost)).toBe(1 * currentRate);
  });

  it("never retroactively changes an existing cost_log's rate when the profile rate changes later", async () => {
    const { data: profileBefore } = await admin
      .from("profiles")
      .select("cost_rate_per_day")
      .eq("id", SEED_USER_ID.member1)
      .single();
    const originalRate = Number(profileBefore?.cost_rate_per_day);
    const bumpedRate = originalRate + 500;

    const { data: firstLog } = await wichai
      .from("time_logs")
      .insert({
        project_id: projectId,
        task_id: taskId,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-20",
        work_hour: 8,
      })
      .select("id")
      .single();

    try {
      await admin.from("profiles").update({ cost_rate_per_day: bumpedRate }).eq("id", SEED_USER_ID.member1);

      const { data: unchangedCostLog } = await admin
        .from("cost_logs")
        .select("cost_rate_per_day")
        .eq("time_log_id", firstLog!.id)
        .single();
      expect(Number(unchangedCostLog?.cost_rate_per_day)).toBe(originalRate);

      const { data: secondLog } = await wichai
        .from("time_logs")
        .insert({
          project_id: projectId,
          task_id: taskId,
          user_id: SEED_USER_ID.member1,
          work_date: "2026-07-21",
          work_hour: 8,
        })
        .select("id")
        .single();

      const { data: newCostLog } = await admin
        .from("cost_logs")
        .select("cost_rate_per_day")
        .eq("time_log_id", secondLog!.id)
        .single();
      expect(Number(newCostLog?.cost_rate_per_day)).toBe(bumpedRate);
    } finally {
      // Always restore the seed rate, even if an assertion above fails.
      await admin.from("profiles").update({ cost_rate_per_day: originalRate }).eq("id", SEED_USER_ID.member1);
    }
  });

  it("deletes the cost_log when its time_log is deleted", async () => {
    const { data: log } = await wichai
      .from("time_logs")
      .insert({
        project_id: projectId,
        task_id: taskId,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-20",
        work_hour: 8,
      })
      .select("id")
      .single();

    await wichai.from("time_logs").delete().eq("id", log!.id);

    const { data: costLogs } = await admin.from("cost_logs").select("id").eq("time_log_id", log!.id);
    expect(costLogs).toHaveLength(0);

    const { data: project } = await admin.from("projects").select("actual_cost").eq("id", projectId).single();
    expect(Number(project?.actual_cost)).toBe(0);
  });
});
