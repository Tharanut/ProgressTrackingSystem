"use client";

import { useActionState } from "react";

import { addMember } from "@/lib/actions/members";
import { type ActionState } from "@/lib/actions/types";

import { FieldError, inputClass, labelClass, submitClass } from "./shared";

const initialState: ActionState = { error: null };

export function AddMemberForm({
  projectId,
  candidates,
}: {
  projectId: string;
  candidates: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addMember, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <input type="hidden" name="project_id" value={projectId} />

      <div>
        <label className={labelClass}>Employee</label>
        <select name="user_id" required className={inputClass}>
          <option value="">- เลือกพนักงาน -</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Project Role</label>
        <input name="project_role" placeholder="Developer / PM / QA" className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Responsibility</label>
        <input name="responsibility" className={inputClass} />
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
          {pending ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
        </button>
      </div>
    </form>
  );
}
