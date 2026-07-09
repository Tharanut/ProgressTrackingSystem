"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { canManageProjects } from "@/lib/auth";
import type { Enums, Json } from "@/lib/database.types";
import { formNum, formStr } from "@/lib/form-utils";
import { createClient } from "@/lib/supabase/server";

import { type ActionState, OK } from "./types";

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !canManageProjects(profile.role)) {
    return { error: "คุณไม่มีสิทธิ์สร้าง Project" };
  }

  const project_code = formStr(formData, "project_code");
  const project_name = formStr(formData, "project_name");
  if (!project_code || !project_name) {
    return { error: "กรุณากรอก Project Code และ Project Name" };
  }

  const payload = {
    project_code,
    project_name,
    project_owner_id: formStr(formData, "project_owner_id") ?? user.id,
    department_id: formStr(formData, "department_id"),
    planned_start_date: formStr(formData, "planned_start_date"),
    planned_end_date: formStr(formData, "planned_end_date"),
    priority: (formStr(formData, "priority") ?? "medium") as Enums<"priority_level">,
    planned_man_day: formNum(formData, "planned_man_day", 0),
    planned_cost: formNum(formData, "planned_cost", 0),
    description: formStr(formData, "description"),
  };

  const { data: created, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Project Code นี้มีอยู่แล้ว กรุณาใช้รหัสอื่น" };
    return { error: `สร้าง Project ไม่สำเร็จ: ${error.message}` };
  }

  await logActivity(supabase, {
    entityType: "project",
    entityId: created.id,
    action: "create",
    newValue: payload as unknown as Json,
  });

  revalidatePath("/projects");
  redirect(`/projects/${created.id}`);
}

export async function updateProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const id = formStr(formData, "id");
  if (!id) return { error: "ไม่พบ Project" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !canManageProjects(profile.role)) {
    return { error: "คุณไม่มีสิทธิ์แก้ไข Project" };
  }

  const { data: before } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!before) return { error: "ไม่พบ Project" };

  const project_name = formStr(formData, "project_name");
  if (!project_name) return { error: "กรุณากรอก Project Name" };

  const payload = {
    project_name,
    project_owner_id: formStr(formData, "project_owner_id"),
    department_id: formStr(formData, "department_id"),
    planned_start_date: formStr(formData, "planned_start_date"),
    planned_end_date: formStr(formData, "planned_end_date"),
    actual_start_date: formStr(formData, "actual_start_date"),
    actual_end_date: formStr(formData, "actual_end_date"),
    status: (formStr(formData, "status") ?? before.status) as Enums<"project_status">,
    priority: (formStr(formData, "priority") ?? before.priority) as Enums<"priority_level">,
    planned_man_day: formNum(formData, "planned_man_day", Number(before.planned_man_day)),
    planned_cost: formNum(formData, "planned_cost", Number(before.planned_cost)),
    description: formStr(formData, "description"),
  };

  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) return { error: `แก้ไข Project ไม่สำเร็จ: ${error.message}` };

  await logActivity(supabase, {
    entityType: "project",
    entityId: id,
    action: "update",
    oldValue: before as unknown as Json,
    newValue: { ...before, ...payload } as unknown as Json,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return OK;
}
