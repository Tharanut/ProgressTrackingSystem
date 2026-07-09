import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { ExportButton } from "@/components/ExportButton";
import { VarianceBadge } from "@/components/VarianceBadge";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CostReportPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: projects }, { data: costLogs }, { data: people }] = await Promise.all([
    supabase.from("projects").select("id, project_code, project_name, planned_cost, actual_cost").order("project_code"),
    supabase.from("cost_logs").select("project_id, user_id, total_cost"),
    supabase.from("profiles").select("id, full_name").eq("is_active", true),
  ]);

  const byProject = (projects ?? []).map((p) => ({
    project_code: p.project_code,
    project_name: p.project_name,
    id: p.id,
    planned_cost: Number(p.planned_cost),
    actual_cost: Number(p.actual_cost),
  }));

  const costByUser = new Map<string, number>();
  for (const c of costLogs ?? []) {
    if (!c.user_id) continue;
    costByUser.set(c.user_id, (costByUser.get(c.user_id) ?? 0) + Number(c.total_cost));
  }
  const byResource = (people ?? [])
    .map((p) => ({ full_name: p.full_name, id: p.id, total_cost: costByUser.get(p.id) ?? 0 }))
    .filter((r) => r.total_cost > 0)
    .sort((a, b) => b.total_cost - a.total_cost);

  const projectColumns = [
    { key: "project_code", label: "Project Code" },
    { key: "project_name", label: "Project Name" },
    { key: "planned_cost", label: "Planned Cost" },
    { key: "actual_cost", label: "Actual Cost" },
    { key: "cost_variance", label: "Cost Variance" },
  ];
  const projectExportRows = byProject.map((p) => ({
    ...p,
    cost_variance: (p.actual_cost - p.planned_cost).toFixed(2),
  }));

  const resourceColumns = [
    { key: "full_name", label: "Employee" },
    { key: "total_cost", label: "Actual Cost" },
  ];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Cost Report</h1>
        <p className="mt-1 text-sm text-zinc-500">Planned vs Actual Cost แยกตาม Project และตามพนักงาน</p>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cost by Project</h2>
            <ExportButton
              columns={projectColumns}
              rows={projectExportRows}
              filename="cost-by-project"
              title="Cost by Project"
            />
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  <th className="py-2 pr-4 font-medium">Planned Cost</th>
                  <th className="py-2 pr-4 font-medium">Actual Cost</th>
                  <th className="py-2 pr-4 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                {byProject.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {p.project_code} · {p.project_name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{p.planned_cost.toLocaleString()}</td>
                    <td className="py-2 pr-4">{p.actual_cost.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <VarianceBadge planned={p.planned_cost} actual={p.actual_cost} decimals={0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cost by Resource</h2>
            <ExportButton columns={resourceColumns} rows={byResource} filename="cost-by-resource" title="Cost by Resource" />
          </div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {byResource.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">ยังไม่มีต้นทุนที่เกิดขึ้นจริง</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Employee</th>
                    <th className="py-2 pr-4 font-medium">Actual Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {byResource.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/resources/${r.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {r.full_name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{r.total_cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
