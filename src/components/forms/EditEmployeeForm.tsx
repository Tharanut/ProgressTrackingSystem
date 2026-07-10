"use client";

import { useActionState } from "react";

import { updateEmployee } from "@/lib/actions/employees";
import { type ActionState } from "@/lib/actions/types";
import { ROLE_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/database.types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

type ProfileDetail = Database["public"]["Tables"]["profiles"]["Row"];

const initialState: ActionState = { error: null };

export function EditEmployeeForm({
  employee,
  departments,
}: {
  employee: ProfileDetail;
  departments: { id: string; department_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateEmployee, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <input type="hidden" name="id" value={employee.id} />

      <div>
        <label className={labelClass}>Username</label>
        <input value={employee.username} disabled className={`${inputClass} opacity-60`} />
      </div>
      <div>
        <label className={labelClass}>ชื่อ-นามสกุล</label>
        <input name="full_name" defaultValue={employee.full_name} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Employee Code</label>
        <input
          name="employee_code"
          defaultValue={employee.employee_code ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <select name="role" defaultValue={employee.role} className={inputClass}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Department</label>
        <select
          name="department_id"
          defaultValue={employee.department_id ?? ""}
          className={inputClass}
        >
          <option value="">- ไม่ระบุ -</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Cost Rate / Day</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="cost_rate_per_day"
          defaultValue={employee.cost_rate_per_day}
          className={inputClass}
        />
      </div>

      {state.error && (
        <div className="sm:col-span-2">
          <FieldError error={state.error} />
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </form>
  );
}
