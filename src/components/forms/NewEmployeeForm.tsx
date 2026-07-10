"use client";

import { useActionState } from "react";

import { createEmployee } from "@/lib/actions/employees";
import { type ActionState } from "@/lib/actions/types";
import { ROLE_LABELS } from "@/lib/constants";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

export function NewEmployeeForm({
  departments,
}: {
  departments: { id: string; department_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createEmployee, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className={labelClass}>Username</label>
        <input
          name="username"
          required
          pattern="[a-z0-9._-]+"
          placeholder="somchai"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>ชื่อ-นามสกุล</label>
        <input name="full_name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>รหัสผ่านเริ่มต้น</label>
        <input
          type="text"
          name="password"
          required
          minLength={6}
          defaultValue="ProjectPulse#2026"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <select name="role" defaultValue="member" className={inputClass}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Department</label>
        <select name="department_id" className={inputClass}>
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
          defaultValue={0}
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
          {pending ? "กำลังสร้าง..." : "เพิ่มพนักงาน"}
        </button>
      </div>
    </form>
  );
}
