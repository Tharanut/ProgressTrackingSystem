"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import type { Json } from "@/lib/database.types";
import { formNum, formStr } from "@/lib/form-utils";
import { createClient } from "@/lib/supabase/server";

import { type ActionState, OK } from "./types";

export async function createTimeLog(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const project_id = formStr(formData, "project_id");
  const work_date = formStr(formData, "work_date");
  const work_hour = formNum(formData, "work_hour", 0);
  if (!project_id || !work_date) return { error: "กรุณาเลือก Project และ Work Date" };
  if (work_hour <= 0) return { error: "Work Hour ต้องมากกว่า 0" };

  const task_id = formStr(formData, "task_id");
  if (task_id) {
    const { data: task } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", task_id)
      .single();
    if (!task || task.project_id !== project_id) {
      return { error: "Task ที่เลือกไม่ตรงกับ Project" };
    }
  }

  const payload = {
    project_id,
    task_id,
    user_id: user.id,
    work_date,
    work_hour,
    work_detail: formStr(formData, "work_detail"),
    issue_blocker: formStr(formData, "issue_blocker"),
  };

  const { data: created, error } = await supabase
    .from("time_logs")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: `บันทึกเวลาไม่สำเร็จ: ${error.message}` };

  await logActivity(supabase, {
    entityType: "time_log",
    entityId: created.id,
    action: "create",
    newValue: payload as unknown as Json,
  });

  revalidatePath("/time-logs");
  revalidatePath(`/projects/${project_id}/tasks`);
  if (task_id) revalidatePath(`/projects/${project_id}/tasks/${task_id}`);
  return OK;
}

export async function deleteTimeLog(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const id = formStr(formData, "id");
  if (!id) return { error: "ไม่พบรายการ" };

  const { data: before } = await supabase.from("time_logs").select("*").eq("id", id).single();

  // RLS restricts delete to the owner (or admin); a mismatched id simply deletes 0 rows.
  const { data: deleted, error } = await supabase
    .from("time_logs")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { error: `ลบรายการไม่สำเร็จ: ${error.message}` };
  if (!deleted || deleted.length === 0) return { error: "คุณไม่มีสิทธิ์ลบรายการนี้" };

  if (before) {
    await logActivity(supabase, {
      entityType: "time_log",
      entityId: id,
      action: "delete",
      oldValue: before as unknown as Json,
    });
  }

  revalidatePath("/time-logs");
  revalidatePath(`/projects/${before?.project_id}/tasks`);
  return OK;
}
