"use client";

import { useActionState } from "react";

import { updateTask } from "@/lib/actions/tasks";
import { type ActionState } from "@/lib/actions/types";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/database.types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

type TaskDetail = Database["public"]["Tables"]["tasks"]["Row"];

const initialState: ActionState = { error: null };

/** `canEditAll` = admin/pm can edit every field; a member assigned to the task can only update progress/status/remark. */
export function EditTaskForm({
  task,
  members,
  canEditAll,
}: {
  task: TaskDetail;
  members: { id: string; full_name: string }[];
  canEditAll: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateTask, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="id" value={task.id} />

      {canEditAll && (
        <>
          <div className="sm:col-span-2">
            <label className={labelClass}>Task Name</label>
            <input name="task_name" defaultValue={task.task_name} required className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Task Description</label>
            <textarea
              name="task_description"
              rows={2}
              defaultValue={task.task_description ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Assigned To</label>
            <select name="assigned_to" defaultValue={task.assigned_to ?? ""} className={inputClass}>
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
            <input
              type="date"
              name="planned_start_date"
              defaultValue={task.planned_start_date ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Planned End Date</label>
            <input
              type="date"
              name="planned_end_date"
              defaultValue={task.planned_end_date ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Actual Start Date</label>
            <input
              type="date"
              name="actual_start_date"
              defaultValue={task.actual_start_date ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Actual End Date</label>
            <input
              type="date"
              name="actual_end_date"
              defaultValue={task.actual_end_date ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Planned Hour</label>
            <input
              type="number"
              step="0.5"
              min="0"
              name="planned_hour"
              defaultValue={task.planned_hour}
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
              defaultValue={task.planned_man_day}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Progress %</label>
        <input
          type="number"
          step="1"
          min="0"
          max="100"
          name="progress_percent"
          defaultValue={task.progress_percent}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select name="status" defaultValue={task.status} className={inputClass}>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Remark</label>
        <textarea name="remark" rows={2} defaultValue={task.remark ?? ""} className={inputClass} />
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
