"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { canManageProjects } from "@/lib/auth";
import type { Enums, Json } from "@/lib/database.types";
import { formNum, formStr } from "@/lib/form-utils";
import { createClient } from "@/lib/supabase/server";

import { type ActionState, OK } from "./types";

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const project_id = formStr(formData, "project_id");
  const task_name = formStr(formData, "task_name");
  if (!project_id || !task_name) return { error: "กรุณากรอก Task Name" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !canManageProjects(profile.role)) {
    return { error: "คุณไม่มีสิทธิ์สร้าง Task" };
  }

  const payload = {
    project_id,
    task_name,
    task_description: formStr(formData, "task_description"),
    assigned_to: formStr(formData, "assigned_to"),
    planned_start_date: formStr(formData, "planned_start_date"),
    planned_end_date: formStr(formData, "planned_end_date"),
    planned_hour: formNum(formData, "planned_hour", 0),
    planned_man_day: formNum(formData, "planned_man_day", 0),
  };

  const { data: created, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: `สร้าง Task ไม่สำเร็จ: ${error.message}` };

  await logActivity(supabase, {
    entityType: "task",
    entityId: created.id,
    action: "create",
    newValue: payload as unknown as Json,
  });

  revalidatePath(`/projects/${project_id}/tasks`);
  return OK;
}

export async function updateTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const id = formStr(formData, "id");
  if (!id) return { error: "ไม่พบ Task" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const { data: before } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (!profile || !before) return { error: "ไม่พบ Task" };

  const isManager = canManageProjects(profile.role);
  const isOwnTask = profile.role === "member" && before.assigned_to === user.id;
  if (!isManager && !isOwnTask) {
    return { error: "คุณไม่มีสิทธิ์แก้ไข Task นี้" };
  }

  // Members may only update their own progress/status/remark — everything else is PM/admin-only.
  const payload = isManager
    ? {
        task_name: formStr(formData, "task_name") ?? before.task_name,
        task_description: formStr(formData, "task_description"),
        assigned_to: formStr(formData, "assigned_to"),
        planned_start_date: formStr(formData, "planned_start_date"),
        planned_end_date: formStr(formData, "planned_end_date"),
        actual_start_date: formStr(formData, "actual_start_date"),
        actual_end_date: formStr(formData, "actual_end_date"),
        planned_hour: formNum(formData, "planned_hour", Number(before.planned_hour)),
        planned_man_day: formNum(formData, "planned_man_day", Number(before.planned_man_day)),
        progress_percent: formNum(formData, "progress_percent", Number(before.progress_percent)),
        status: (formStr(formData, "status") ?? before.status) as Enums<"task_status">,
        remark: formStr(formData, "remark"),
      }
    : {
        progress_percent: formNum(formData, "progress_percent", Number(before.progress_percent)),
        status: (formStr(formData, "status") ?? before.status) as Enums<"task_status">,
        remark: formStr(formData, "remark"),
      };

  // RLS filters non-matching rows silently on UPDATE (no error) — confirm a row was
  // actually affected instead of trusting a null `error`.
  const { data: updated, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select("id");
  if (error) return { error: `แก้ไข Task ไม่สำเร็จ: ${error.message}` };
  if (!updated || updated.length === 0) return { error: "คุณไม่มีสิทธิ์แก้ไข Task นี้" };

  await logActivity(supabase, {
    entityType: "task",
    entityId: id,
    action: "update",
    oldValue: before as unknown as Json,
    newValue: { ...before, ...payload } as unknown as Json,
  });

  revalidatePath(`/projects/${before.project_id}/tasks`);
  revalidatePath(`/projects/${before.project_id}/tasks/${id}`);
  return OK;
}
