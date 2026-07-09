import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ExportButton } from "@/components/ExportButton";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { VarianceBadge } from "@/components/VarianceBadge";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type RawRow = {
  id: string;
  project_code: string;
  project_name: string;
  status: keyof typeof PROJECT_STATUS_LABELS;
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  planned_cost: number;
  actual_cost: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  owner: { full_name: string } | null;
  department: { department_name: string } | null;
};

export default async function ProjectSummaryReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const profile = await requireProfile();
  const { from, to } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(
      `id, project_code, project_name, status, progress_percent, planned_man_day, actual_man_day,
       planned_cost, actual_cost, planned_start_date, planned_end_date,
       owner:profiles!projects_project_owner_id_fkey(full_name),
       department:departments(department_name)`,
    )
    .order("project_code");

  if (from) query = query.gte("planned_start_date", from);
  if (to) query = query.lte("planned_start_date", to);

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawRow[];

  const exportRows = rows.map((p) => ({
    project_code: p.project_code,
    project_name: p.project_name,
    owner: p.owner?.full_name ?? "-",
    department: p.department?.department_name ?? "-",
    status: PROJECT_STATUS_LABELS[p.status],
    progress_percent: Number(p.progress_percent),
    planned_man_day: Number(p.planned_man_day),
    actual_man_day: Number(p.actual_man_day),
    md_variance: (Number(p.actual_man_day) - Number(p.planned_man_day)).toFixed(2),
    planned_cost: Number(p.planned_cost),
    actual_cost: Number(p.actual_cost),
    cost_variance: (Number(p.actual_cost) - Number(p.planned_cost)).toFixed(2),
    planned_start_date: p.planned_start_date ?? "-",
    planned_end_date: p.planned_end_date ?? "-",
  }));

  const columns = [
    { key: "project_code", label: "Project Code" },
    { key: "project_name", label: "Project Name" },
    { key: "owner", label: "Owner" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status" },
    { key: "progress_percent", label: "Progress %" },
    { key: "planned_man_day", label: "Planned MD" },
    { key: "actual_man_day", label: "Actual MD" },
    { key: "md_variance", label: "MD Variance" },
    { key: "planned_cost", label: "Planned Cost" },
    { key: "actual_cost", label: "Actual Cost" },
    { key: "cost_variance", label: "Cost Variance" },
    { key: "planned_start_date", label: "Planned Start" },
    { key: "planned_end_date", label: "Planned End" },
  ];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Summary Report</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Progress, Man-Day, Cost และ Variance ของทุก Project
            </p>
          </div>
          <ExportButton
            columns={columns}
            rows={exportRows}
            filename="project-summary"
            title="Project Summary Report"
          />
        </div>

        <div className="mt-4">
          <DateRangeFilter from={from} to={to} />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Project</th>
                <th className="py-2 pr-4 font-medium">Owner</th>
                <th className="py-2 pr-4 font-medium">Department</th>
                <th className="py-2 pr-4 font-medium">Progress</th>
                <th className="py-2 pr-4 font-medium">MD Variance</th>
                <th className="py-2 pr-4 font-medium">Cost Variance</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {p.project_code} · {p.project_name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {p.owner?.full_name ?? "-"}
                  </td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                    {p.department?.department_name ?? "-"}
                  </td>
                  <td className="py-2 pr-4">{Number(p.progress_percent)}%</td>
                  <td className="py-2 pr-4">
                    <VarianceBadge
                      planned={Number(p.planned_man_day)}
                      actual={Number(p.actual_man_day)}
                      unit="MD"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <VarianceBadge
                      planned={Number(p.planned_cost)}
                      actual={Number(p.actual_cost)}
                      decimals={0}
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <ProjectStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
