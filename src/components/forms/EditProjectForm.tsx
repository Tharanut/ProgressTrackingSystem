"use client";

import { useActionState } from "react";

import { updateProject } from "@/lib/actions/projects";
import { type ActionState } from "@/lib/actions/types";
import { PRIORITY_LABELS, PROJECT_STATUS_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/database.types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

type ProjectDetail = Database["public"]["Tables"]["projects"]["Row"];

const initialState: ActionState = { error: null };

export function EditProjectForm({
  project,
  profiles,
  departments,
}: {
  project: ProjectDetail;
  profiles: { id: string; full_name: string }[];
  departments: { id: string; department_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateProject, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="id" value={project.id} />

      <div className="sm:col-span-2">
        <label className={labelClass}>Project Name</label>
        <input
          name="project_name"
          defaultValue={project.project_name}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Owner</label>
        <select
          name="project_owner_id"
          defaultValue={project.project_owner_id ?? ""}
          className={inputClass}
        >
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
        <select
          name="department_id"
          defaultValue={project.department_id ?? ""}
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
        <label className={labelClass}>Status</label>
        <select name="status" defaultValue={project.status} className={inputClass}>
          {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Priority</label>
        <select name="priority" defaultValue={project.priority} className={inputClass}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Planned Start Date</label>
        <input
          type="date"
          name="planned_start_date"
          defaultValue={project.planned_start_date ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Planned End Date</label>
        <input
          type="date"
          name="planned_end_date"
          defaultValue={project.planned_end_date ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Actual Start Date</label>
        <input
          type="date"
          name="actual_start_date"
          defaultValue={project.actual_start_date ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Actual End Date</label>
        <input
          type="date"
          name="actual_end_date"
          defaultValue={project.actual_end_date ?? ""}
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
          defaultValue={project.planned_man_day}
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
          defaultValue={project.planned_cost}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={project.description ?? ""}
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
