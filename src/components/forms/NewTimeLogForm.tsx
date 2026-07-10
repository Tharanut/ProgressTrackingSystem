"use client";

import { useActionState, useState } from "react";

import { createTimeLog } from "@/lib/actions/time-logs";
import { type ActionState } from "@/lib/actions/types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

export function NewTimeLogForm({
  projects,
  tasks,
}: {
  projects: { id: string; project_code: string; project_name: string }[];
  tasks: { id: string; project_id: string; task_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTimeLog, initialState);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const taskOptions = tasks.filter((t) => t.project_id === projectId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className={labelClass}>Project</label>
        <select
          name="project_id"
          required
          className={inputClass}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">- เลือก Project -</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_code} · {p.project_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Task</label>
        <select name="task_id" className={inputClass} disabled={!projectId}>
          <option value="">- ไม่ระบุ -</option>
          {taskOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.task_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Work Date</label>
        <input type="date" name="work_date" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Work Hour</label>
        <input
          type="number"
          step="0.5"
          min="0.5"
          max="24"
          name="work_hour"
          required
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Work Detail</label>
        <textarea name="work_detail" rows={2} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Issue / Blocker</label>
        <textarea name="issue_blocker" rows={2} className={inputClass} />
      </div>

      {state.error && (
        <div className="sm:col-span-2">
          <FieldError error={state.error} />
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "กำลังบันทึก..." : "บันทึกเวลาทำงาน"}
        </button>
      </div>
    </form>
  );
}
