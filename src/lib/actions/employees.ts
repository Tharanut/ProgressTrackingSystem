"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { usernameToEmail } from "@/lib/constants";
import type { Enums, Json } from "@/lib/database.types";
import { formNum, formStr } from "@/lib/form-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { type ActionState, OK } from "./types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "กรุณาเข้าสู่ระบบ" } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return { supabase, user, error: "คุณไม่มีสิทธิ์จัดการพนักงาน" } as const;
  }
  return { supabase, user, error: null } as const;
}

async function nextEmployeeCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("employee_code")
    .not("employee_code", "is", null)
    .order("employee_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const last = data?.employee_code ?? "EMP-0000";
  const n = Number(last.replace(/^EMP-/, "")) || 0;
  return `EMP-${String(n + 1).padStart(4, "0")}`;
}

export async function createEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const username = formStr(formData, "username")?.toLowerCase() ?? null;
  const full_name = formStr(formData, "full_name");
  const password = formStr(formData, "password");
  const role = (formStr(formData, "role") ?? "member") as Enums<"user_role">;
  const department_id = formStr(formData, "department_id");
  const cost_rate_per_day = formNum(formData, "cost_rate_per_day", 0);

  if (!username || !full_name || !password) {
    return { error: "กรุณากรอก Username, ชื่อ-นามสกุล และรหัสผ่าน" };
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return { error: "Username ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และ . _ - เท่านั้น" };
  }
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, full_name, role },
  });

  if (createError || !created.user) {
    if (createError?.code === "email_exists") {
      return { error: "Username นี้มีผู้ใช้งานแล้ว กรุณาใช้ชื่ออื่น" };
    }
    return { error: `สร้างพนักงานไม่สำเร็จ: ${createError?.message ?? "unknown error"}` };
  }

  const employee_code = await nextEmployeeCode(supabase);
  const payload = { employee_code, department_id, cost_rate_per_day };

  const { error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", created.user.id);
  if (updateError) {
    return {
      error: `สร้างบัญชีสำเร็จ แต่บันทึกข้อมูลเพิ่มเติมไม่สำเร็จ: ${updateError.message}`,
    };
  }

  await logActivity(supabase, {
    entityType: "profile",
    entityId: created.user.id,
    action: "create",
    newValue: { username, full_name, role, ...payload } as unknown as Json,
  });

  revalidatePath("/employees");
  redirect(`/employees/${created.user.id}`);
}

export async function updateEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = formStr(formData, "id");
  if (!id) return { error: "ไม่พบพนักงาน" };

  const { data: before } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!before) return { error: "ไม่พบพนักงาน" };

  const full_name = formStr(formData, "full_name");
  if (!full_name) return { error: "กรุณากรอกชื่อ-นามสกุล" };

  const payload = {
    full_name,
    employee_code: formStr(formData, "employee_code"),
    department_id: formStr(formData, "department_id"),
    role: (formStr(formData, "role") ?? before.role) as Enums<"user_role">,
    cost_rate_per_day: formNum(formData, "cost_rate_per_day", Number(before.cost_rate_per_day)),
  };

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select("id");

  if (updateError) {
    if (updateError.code === "23505")
      return { error: "Employee Code นี้มีอยู่แล้ว กรุณาใช้รหัสอื่น" };
    return { error: `แก้ไขข้อมูลไม่สำเร็จ: ${updateError.message}` };
  }
  if (!updated || updated.length === 0) return { error: "คุณไม่มีสิทธิ์แก้ไขพนักงานคนนี้" };

  await logActivity(supabase, {
    entityType: "profile",
    entityId: id,
    action: "update",
    oldValue: before as unknown as Json,
    newValue: { ...before, ...payload } as unknown as Json,
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  return OK;
}

export async function setEmployeeActive(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = formStr(formData, "id");
  const is_active = formStr(formData, "is_active") === "true";
  if (!id) return { error: "ไม่พบพนักงาน" };

  if (user && id === user.id && !is_active) {
    return { error: "ไม่สามารถปิดใช้งานบัญชีของตัวเองได้" };
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ is_active })
    .eq("id", id)
    .select("id");

  if (updateError) return { error: `เปลี่ยนสถานะไม่สำเร็จ: ${updateError.message}` };
  if (!updated || updated.length === 0) return { error: "คุณไม่มีสิทธิ์เปลี่ยนสถานะพนักงานคนนี้" };

  await logActivity(supabase, {
    entityType: "profile",
    entityId: id,
    action: "update",
    newValue: { is_active } as unknown as Json,
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  return OK;
}
