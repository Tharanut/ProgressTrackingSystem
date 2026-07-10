"use client";

import { useActionState } from "react";

import { createProject } from "@/lib/actions/projects";
import { type ActionState } from "@/lib/actions/types";
import { PRIORITY_LABELS } from "@/lib/constants";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

export function NewProjectForm({
  profiles,
  departments,
}: {
  profiles: { id: string; full_name: string }[];
  departments: { id: string; department_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createProject, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className={labelClass}>Project Code</label>
        <input name="project_code" required className={inputClass} placeholder="PRJ-003" />
      </div>
      <div>
        <label className={labelClass}>Project Name</label>
        <input name="project_name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Owner</label>
        <select name="project_owner_id" className={inputClass}>
          <option value="">- ไม่ระบุ -</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
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
        <label className={labelClass}>Planned Start Date</label>
        <input type="date" name="planned_start_date" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Planned End Date</label>
        <input type="date" name="planned_end_date" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Priority</label>
        <select name="priority" defaultValue="medium" className={inputClass}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Planned Man-Day</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="planned_man_day"
          defaultValue={0}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Planned Cost</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="planned_cost"
          defaultValue={0}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={2} className={inputClass} />
      </div>

      {state.error && (
        <div className="sm:col-span-2">
          <FieldError error={state.error} />
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "กำลังสร้าง..." : "สร้าง Project"}
        </button>
      </div>
    </form>
  );
}
