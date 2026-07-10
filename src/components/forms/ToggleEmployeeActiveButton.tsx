"use client";

import { useActionState } from "react";

import { setEmployeeActive } from "@/lib/actions/employees";
import { type ActionState } from "@/lib/actions/types";

const initialState: ActionState = { error: null };

export function ToggleEmployeeActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [state, formAction, pending] = useActionState(setEmployeeActive, initialState);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="is_active" value={(!isActive).toString()} />
      <button
        type="submit"
        disabled={pending}
        className={
          isActive
            ? "rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            : "rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
        }
        onClick={(e) => {
          const msg = isActive ? "ปิดใช้งานพนักงานคนนี้?" : "เปิดใช้งานพนักงานคนนี้อีกครั้ง?";
          if (!confirm(msg)) e.preventDefault();
        }}
      >
        {pending ? "กำลังบันทึก..." : isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
