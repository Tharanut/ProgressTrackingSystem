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
 * Actual Man-Day and weighted Progress % are computed by DB triggers (migration `06`), not app
 * code — these tests exercise the real trigger chain against the dev Supabase project.
 */
describe("Man-Day & Progress % triggers (docs/spec.md §9.1, §9.5 Option 3)", () => {
  let admin: SupabaseClient<Database>;
  let wichai: SupabaseClient<Database>;
  let projectId: string;

  beforeAll(async () => {
    // Sign in once per role and reuse — Supabase Auth rate-limits sign-ins per IP.
    admin = await signIn("admin");
    wichai = await signIn("wichai");
  });

  beforeEach(async () => {
    const project = await createTestProject(admin, { planned_man_day: 10 });
    projectId = project.id;
  });

  afterEach(async () => {
    await cleanupTestProject(admin, projectId);
  });

  it("derives task.actual_hour/actual_man_day from the sum of its time_logs (Hour / 8)", async () => {
    const task = await createTestTask(admin, projectId, { planned_man_day: 4 });

    await wichai.from("time_logs").insert({
      project_id: projectId,
      task_id: task.id,
      user_id: SEED_USER_ID.member1,
      work_date: "2026-07-20",
      work_hour: 16,
    });

    const { data: updated } = await admin
      .from("tasks")
      .select("actual_hour, actual_man_day")
      .eq("id", task.id)
      .single();

    expect(Number(updated?.actual_hour)).toBe(16);
    expect(Number(updated?.actual_man_day)).toBe(2); // 16 / 8
  });

  it("rolls task actual_man_day up into project.actual_man_day", async () => {
    const taskA = await createTestTask(admin, projectId, { planned_man_day: 4 });
    const taskB = await createTestTask(admin, projectId, { planned_man_day: 6 });

    await wichai.from("time_logs").insert([
      {
        project_id: projectId,
        task_id: taskA.id,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-20",
        work_hour: 8,
      },
      {
        project_id: projectId,
        task_id: taskB.id,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-21",
        work_hour: 24,
      },
    ]);

    const { data: project } = await admin
      .from("projects")
      .select("actual_man_day")
      .eq("id", projectId)
      .single();
    expect(Number(project?.actual_man_day)).toBe(4); // 1 MD + 3 MD
  });

  it("computes project.progress_percent as a weighted average by planned_man_day (Option 3)", async () => {
    // taskA: planned 4 MD, 100% done. taskB: planned 6 MD, 50% done.
    // weighted = (100*4 + 50*6) / (4+6) = 70
    const taskA = await createTestTask(admin, projectId, { planned_man_day: 4 });
    const taskB = await createTestTask(admin, projectId, { planned_man_day: 6 });

    await admin.from("tasks").update({ progress_percent: 100 }).eq("id", taskA.id);
    await admin.from("tasks").update({ progress_percent: 50 }).eq("id", taskB.id);

    const { data: project } = await admin
      .from("projects")
      .select("progress_percent")
      .eq("id", projectId)
      .single();
    expect(Number(project?.progress_percent)).toBe(70);
  });

  it("recomputes actuals downward when a time_log is deleted", async () => {
    const task = await createTestTask(admin, projectId, { planned_man_day: 4 });

    const { data: log } = await wichai
      .from("time_logs")
      .insert({
        project_id: projectId,
        task_id: task.id,
        user_id: SEED_USER_ID.member1,
        work_date: "2026-07-20",
        work_hour: 8,
      })
      .select("id")
      .single();

    await wichai.from("time_logs").delete().eq("id", log!.id);

    const { data: updated } = await admin
      .from("tasks")
      .select("actual_hour, actual_man_day")
      .eq("id", task.id)
      .single();
    expect(Number(updated?.actual_hour)).toBe(0);
    expect(Number(updated?.actual_man_day)).toBe(0);
  });
});
