"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { canManageProjects } from "@/lib/auth";
import type { Json } from "@/lib/database.types";
import { formNum, formStr } from "@/lib/form-utils";
import { createClient } from "@/lib/supabase/server";

import { type ActionState, OK } from "./types";

export async function addMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const project_id = formStr(formData, "project_id");
  const user_id = formStr(formData, "user_id");
  if (!project_id || !user_id) return { error: "กรุณาเลือก Project และ Employee" };

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
    return { error: "คุณไม่มีสิทธิ์เพิ่มสมาชิก" };
  }

  const payload = {
    project_id,
    user_id,
    project_role: formStr(formData, "project_role"),
    responsibility: formStr(formData, "responsibility"),
    planned_man_day: formNum(formData, "planned_man_day", 0),
  };

  const { data: created, error } = await supabase
    .from("project_members")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "คนนี้อยู่ใน Project นี้อยู่แล้ว" };
    return { error: `เพิ่มสมาชิกไม่สำเร็จ: ${error.message}` };
  }

  await logActivity(supabase, {
    entityType: "project_member",
    entityId: created.id,
    action: "create",
    newValue: payload as unknown as Json,
  });

  revalidatePath(`/projects/${project_id}/members`);
  return OK;
}

export async function removeMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const id = formStr(formData, "id");
  const project_id = formStr(formData, "project_id");
  if (!id || !project_id) return { error: "ไม่พบสมาชิก" };

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
    return { error: "คุณไม่มีสิทธิ์ลบสมาชิก" };
  }

  const { data: before } = await supabase.from("project_members").select("*").eq("id", id).single();

  const { data: deleted, error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { error: `ลบสมาชิกไม่สำเร็จ: ${error.message}` };
  if (!deleted || deleted.length === 0) return { error: "คุณไม่มีสิทธิ์ลบสมาชิกนี้" };

  if (before) {
    await logActivity(supabase, {
      entityType: "project_member",
      entityId: id,
      action: "delete",
      oldValue: before as unknown as Json,
    });
  }

  revalidatePath(`/projects/${project_id}/members`);
  return OK;
}
