import type { Database } from "@/lib/database.types";
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";

type ProjectStatus = Database["public"]["Enums"]["project_status"];
type TaskStatus = Database["public"]["Enums"]["task_status"];

const TONE = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const PROJECT_COLORS: Record<ProjectStatus, string> = {
  planning: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  delayed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  cancelled: "bg-zinc-200 text-zinc-500 line-through dark:bg-zinc-800 dark:text-zinc-500",
};

const TASK_COLORS: Record<TaskStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  delayed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`${TONE} ${PROJECT_COLORS[status]}`}>{PROJECT_STATUS_LABELS[status]}</span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${TONE} ${TASK_COLORS[status]}`}>{TASK_STATUS_LABELS[status]}</span>;
}
