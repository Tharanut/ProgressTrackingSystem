"use client";

import { useActionState } from "react";

import { removeMember } from "@/lib/actions/members";
import { type ActionState } from "@/lib/actions/types";

const initialState: ActionState = { error: null };

export function RemoveMemberButton({ id, projectId }: { id: string; projectId: string }) {
  const [state, formAction, pending] = useActionState(removeMember, initialState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="project_id" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        onClick={(e) => {
          if (!confirm("ลบสมาชิกนี้ออกจาก Project?")) e.preventDefault();
        }}
      >
        {pending ? "กำลังลบ..." : "ลบ"}
      </button>
      {state.error && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
