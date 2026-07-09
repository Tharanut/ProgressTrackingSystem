import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { DashboardCard } from "@/components/DashboardCard";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { ProjectTable, type ProjectRow } from "@/components/ProjectTable";
import { ResourceUtilizationBar } from "@/components/ResourceUtilizationBar";
import { requireProfile } from "@/lib/auth";
import { isProjectOverdue, utilizationPercent } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/server";

type RawProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  status: ProjectRow["status"];
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  planned_cost: number;
  actual_cost: number;
  planned_end_date: string | null;
  created_at: string;
  department: { department_name: string } | null;
  owner: { full_name: string } | null;
  project_members: { count: number }[];
};

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: projectData }, { data: members }, { data: people }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `id, project_code, project_name, status, progress_percent, planned_man_day, actual_man_day,
         planned_cost, actual_cost, planned_end_date, created_at,
         department:departments(department_name),
         owner:profiles!projects_project_owner_id_fkey(full_name),
         project_members(count)`,
      )
      .order("created_at", { ascending: false }),
    supabase.from("project_members").select("project_id, user_id, planned_man_day, actual_man_day"),
    supabase.from("profiles").select("id, full_name").eq("is_active", true),
  ]);

  const rows = (projectData ?? []) as unknown as RawProjectRow[];
  const today = new Date().toISOString().slice(0, 10);

  const totalPlannedMD = rows.reduce((sum, p) => sum + Number(p.planned_man_day), 0);
  const totalActualMD = rows.reduce((sum, p) => sum + Number(p.actual_man_day), 0);
  const mdVariance = totalActualMD - totalPlannedMD;

  const totalPlannedCost = rows.reduce((sum, p) => sum + Number(p.planned_cost), 0);
  const totalActualCost = rows.reduce((sum, p) => sum + Number(p.actual_cost), 0);
  const costVariance = totalActualCost - totalPlannedCost;
  const costVariancePercent = totalPlannedCost > 0 ? (costVariance / totalPlannedCost) * 100 : 0;

  const counts = {
    total: rows.length,
    in_progress: rows.filter((p) => p.status === "in_progress").length,
    completed: rows.filter((p) => p.status === "completed").length,
    delayed: rows.filter((p) => p.status === "delayed").length,
  };

  const recent: ProjectRow[] = rows.slice(0, 5).map((p) => ({
    id: p.id,
    project_code: p.project_code,
    project_name: p.project_name,
    status: p.status,
    progress_percent: Number(p.progress_percent),
    planned_man_day: Number(p.planned_man_day),
    actual_man_day: Number(p.actual_man_day),
    owner_name: p.owner?.full_name ?? null,
    member_count: p.project_members?.[0]?.count ?? 0,
  }));

  // Department breakdown
  const byDepartment = new Map<string, { count: number; plannedMd: number; actualMd: number }>();
  for (const p of rows) {
    const key = p.department?.department_name ?? "ไม่ระบุแผนก";
    const entry = byDepartment.get(key) ?? { count: 0, plannedMd: 0, actualMd: 0 };
    entry.count += 1;
    entry.plannedMd += Number(p.planned_man_day);
    entry.actualMd += Number(p.actual_man_day);
    byDepartment.set(key, entry);
  }

  // Top 5 delayed projects: explicit `delayed` status OR overdue (planned_end_date passed, not done)
  const delayedProjects = rows
    .filter(
      (p) =>
        p.status === "delayed" ||
        isProjectOverdue(p.planned_end_date, Number(p.progress_percent), today),
    )
    .map((p) => ({
      ...p,
      daysOverdue: p.planned_end_date
        ? Math.max(
            0,
            Math.round(
              (new Date(today).getTime() - new Date(p.planned_end_date).getTime()) / 86400000,
            ),
          )
        : 0,
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 5);

  // Top 5 overloaded resources (aggregate project_members by user)
  const byUser = new Map<string, { plannedMd: number; actualMd: number }>();
  for (const m of members ?? []) {
    const entry = byUser.get(m.user_id) ?? { plannedMd: 0, actualMd: 0 };
    entry.plannedMd += Number(m.planned_man_day);
    entry.actualMd += Number(m.actual_man_day);
    byUser.set(m.user_id, entry);
  }
  const overloadedResources = (people ?? [])
    .map((person) => {
      const agg = byUser.get(person.id) ?? { plannedMd: 0, actualMd: 0 };
      return { ...person, utilization: utilizationPercent(agg.plannedMd, agg.actualMd), ...agg };
    })
    .filter((r) => r.utilization > 100)
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 5);

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">ยินดีต้อนรับ, {profile.full_name}</p>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DashboardCard label="Total Projects" value={counts.total} />
          <DashboardCard label="In Progress" value={counts.in_progress} />
          <DashboardCard label="Completed" value={counts.completed} tone="success" />
          <DashboardCard label="Delayed" value={counts.delayed} tone="danger" />
        </section>

        <section className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DashboardCard label="Planned Man-Day" value={totalPlannedMD.toFixed(2)} />
          <DashboardCard label="Actual Man-Day" value={totalActualMD.toFixed(2)} />
          <DashboardCard
            label="Man-Day Variance"
            value={mdVariance.toFixed(2)}
            tone={mdVariance > 0 ? "danger" : "success"}
          />
        </section>

        <section className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DashboardCard label="Planned Cost" value={totalPlannedCost.toLocaleString()} />
          <DashboardCard label="Actual Cost" value={totalActualCost.toLocaleString()} />
          <DashboardCard
            label="Cost Variance"
            value={`${costVariance >= 0 ? "+" : ""}${costVariancePercent.toFixed(0)}%`}
            tone={costVariance > 0 ? "danger" : "success"}
          />
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Project by Department</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Department</th>
                    <th className="py-2 pr-4 font-medium">Projects</th>
                    <th className="py-2 pr-4 font-medium">Planned MD</th>
                    <th className="py-2 pr-4 font-medium">Actual MD</th>
                  </tr>
                </thead>
                <tbody>
                  {[...byDepartment.entries()].map(([name, d]) => (
                    <tr
                      key={name}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="py-2 pr-4 font-medium">{name}</td>
                      <td className="py-2 pr-4">{d.count}</td>
                      <td className="py-2 pr-4">{d.plannedMd}</td>
                      <td className="py-2 pr-4">{d.actualMd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Top 5 Overloaded Resources</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              {overloadedResources.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500">
                  ไม่มี Resource ที่ Overload
                </p>
              ) : (
                <table className="w-full min-w-max text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                      <th className="py-2 pr-4 font-medium">Employee</th>
                      <th className="py-2 pr-4 font-medium">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overloadedResources.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                      >
                        <td className="py-2 pr-4">
                          <Link
                            href={`/resources/${r.id}`}
                            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {r.full_name}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <ResourceUtilizationBar percent={r.utilization} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Top 5 Delayed Projects</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {delayedProjects.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">ไม่มี Project ที่ล่าช้า</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Project</th>
                    <th className="py-2 pr-4 font-medium">Days Overdue</th>
                    <th className="py-2 pr-4 font-medium">Progress</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {delayedProjects.map((p) => (
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
                      <td className="py-2 pr-4 text-red-600 dark:text-red-400">
                        {p.daysOverdue} วัน
                      </td>
                      <td className="py-2 pr-4">{Number(p.progress_percent)}%</td>
                      <td className="py-2 pr-4">
                        <ProjectStatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Project ล่าสุด</h2>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <ProjectTable projects={recent} />
          </div>
        </section>
      </main>
    </>
  );
}
