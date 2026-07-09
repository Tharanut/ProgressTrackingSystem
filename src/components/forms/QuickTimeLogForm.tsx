"use client";

import { useActionState } from "react";

import { createTimeLog } from "@/lib/actions/time-logs";
import { type ActionState } from "@/lib/actions/types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

/** Simplified time-log form for a page that already knows its project/task. */
export function QuickTimeLogForm({ projectId, taskId }: { projectId: string; taskId: string }) {
  const [state, formAction, pending] = useActionState(createTimeLog, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="task_id" value={taskId} />

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
