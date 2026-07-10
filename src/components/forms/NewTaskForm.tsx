"use client";

import { useActionState } from "react";

import { createTask } from "@/lib/actions/tasks";
import { type ActionState } from "@/lib/actions/types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

export function NewTaskForm({
  projectId,
  members,
}: {
  projectId: string;
  members: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTask, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <input type="hidden" name="project_id" value={projectId} />

      <div className="sm:col-span-2">
        <label className={labelClass}>Task Name</label>
        <input name="task_name" required className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Task Description</label>
        <textarea name="task_description" rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Assigned To</label>
        <select name="assigned_to" className={inputClass}>
          <option value="">- ไม่ระบุ -</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>
      <div />
      <div>
        <label className={labelClass}>Planned Start Date</label>
        <input type="date" name="planned_start_date" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Planned End Date</label>
        <input type="date" name="planned_end_date" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Planned Hour</label>
        <input
          type="number"
          step="0.5"
          min="0"
          name="planned_hour"
          defaultValue={0}
          className={inputClass}
        />
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

      {state.error && (
        <div className="sm:col-span-2">
          <FieldError error={state.error} />
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "กำลังสร้าง..." : "สร้าง Task"}
        </button>
      </div>
    </form>
  );
}
