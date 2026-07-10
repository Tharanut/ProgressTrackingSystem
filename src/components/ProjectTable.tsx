import Link from "next/link";

import { ProgressBar } from "@/components/ProgressBar";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import type { Database } from "@/lib/database.types";

export type ProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  status: Database["public"]["Enums"]["project_status"];
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  owner_name: string | null;
  member_count: number;
};

export function ProjectTable({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">ยังไม่มี Project</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
            <th className="py-2 pr-4 font-medium">Project Code</th>
            <th className="py-2 pr-4 font-medium">Project Name</th>
            <th className="py-2 pr-4 font-medium">Owner</th>
            <th className="py-2 pr-4 font-medium">Members</th>
            <th className="py-2 pr-4 font-medium">Progress</th>
            <th className="py-2 pr-4 font-medium">Planned MD</th>
            <th className="py-2 pr-4 font-medium">Actual MD</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-900"
            >
              <td className="py-2 pr-4">
                <Link
                  href={`/projects/${p.id}`}
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {p.project_code}
                </Link>
              </td>
              <td className="py-2 pr-4">{p.project_name}</td>
              <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                {p.owner_name ?? "-"}
              </td>
              <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{p.member_count}</td>
              <td className="py-2 pr-4">
                <ProgressBar percent={p.progress_percent} />
              </td>
              <td className="py-2 pr-4">{p.planned_man_day}</td>
              <td className="py-2 pr-4">{p.actual_man_day}</td>
              <td className="py-2 pr-4">
                <ProjectStatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
