"use client";

import { useActionState } from "react";

import { deleteTimeLog } from "@/lib/actions/time-logs";
import { type ActionState } from "@/lib/actions/types";

const initialState: ActionState = { error: null };

export function DeleteTimeLogButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteTimeLog, initialState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        onClick={(e) => {
          if (!confirm("ลบรายการเวลานี้?")) e.preventDefault();
        }}
      >
        {pending ? "กำลังลบ..." : "ลบ"}
      </button>
      {state.error && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
