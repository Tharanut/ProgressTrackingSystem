import Link from "next/link";

import { ProgressBar } from "@/components/ProgressBar";
import { TaskStatusBadge } from "@/components/StatusBadge";
import { VarianceBadge } from "@/components/VarianceBadge";
import type { Database } from "@/lib/database.types";

export type TaskRow = {
  id: string;
  task_name: string;
  status: Database["public"]["Enums"]["task_status"];
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  assigned_name: string | null;
  planned_end_date: string | null;
};

export function TaskTable({ projectId, tasks }: { projectId: string; tasks: TaskRow[] }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">ยังไม่มี Task</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
            <th className="py-2 pr-4 font-medium">Task</th>
            <th className="py-2 pr-4 font-medium">Assigned To</th>
            <th className="py-2 pr-4 font-medium">Planned End</th>
            <th className="py-2 pr-4 font-medium">Progress</th>
            <th className="py-2 pr-4 font-medium">Planned MD</th>
            <th className="py-2 pr-4 font-medium">Actual MD</th>
            <th className="py-2 pr-4 font-medium">MD Variance</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-900"
            >
              <td className="py-2 pr-4">
                <Link
                  href={`/projects/${projectId}/tasks/${t.id}`}
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {t.task_name}
                </Link>
              </td>
              <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                {t.assigned_name ?? "-"}
              </td>
              <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                {t.planned_end_date ?? "-"}
              </td>
              <td className="py-2 pr-4">
                <ProgressBar percent={t.progress_percent} />
              </td>
              <td className="py-2 pr-4">{t.planned_man_day}</td>
              <td className="py-2 pr-4">{t.actual_man_day}</td>
              <td className="py-2 pr-4">
                <VarianceBadge planned={t.planned_man_day} actual={t.actual_man_day} />
              </td>
              <td className="py-2 pr-4">
                <TaskStatusBadge status={t.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
