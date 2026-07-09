import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { DashboardCard } from "@/components/DashboardCard";
import { ResourceUtilizationBar } from "@/components/ResourceUtilizationBar";
import { requireProfile } from "@/lib/auth";
import { isOverload, utilizationPercent } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: profiles }, { data: members }, { data: tasks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, employee_code, departments(department_name)")
      .eq("is_active", true)
      .order("full_name"),
    supabase.from("project_members").select("project_id, user_id, planned_man_day, actual_man_day"),
    supabase.from("tasks").select("assigned_to").not("assigned_to", "is", null),
  ]);

  type ProfileRow = {
    id: string;
    full_name: string;
    employee_code: string | null;
    departments: { department_name: string } | null;
  };
  const profileRows = (profiles ?? []) as unknown as ProfileRow[];

  const resources = profileRows.map((p) => {
    const own = (members ?? []).filter((m) => m.user_id === p.id);
    const plannedMd = own.reduce((sum, m) => sum + Number(m.planned_man_day), 0);
    const actualMd = own.reduce((sum, m) => sum + Number(m.actual_man_day), 0);
    const utilization = utilizationPercent(plannedMd, actualMd);
    return {
      id: p.id,
      full_name: p.full_name,
      department: p.departments?.department_name ?? "-",
      projectCount: new Set(own.map((m) => m.project_id)).size,
      taskCount: (tasks ?? []).filter((t) => t.assigned_to === p.id).length,
      plannedMd,
      actualMd,
      utilization,
    };
  });

  resources.sort((a, b) => b.utilization - a.utilization);
  const overloadCount = resources.filter((r) => isOverload(r.utilization)).length;

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Resource Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">ภาระงานของแต่ละคนในทุก Project</p>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DashboardCard label="Total Resources" value={resources.length} />
          <DashboardCard label="Overloaded (&gt;100%)" value={overloadCount} tone="danger" />
          <DashboardCard
            label="Avg Utilization"
            value={
              resources.length
                ? `${Math.round(resources.reduce((s, r) => s + r.utilization, 0) / resources.length)}%`
                : "-"
            }
          />
        </section>

        <section className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Employee</th>
                <th className="py-2 pr-4 font-medium">Department</th>
                <th className="py-2 pr-4 font-medium">Projects</th>
                <th className="py-2 pr-4 font-medium">Tasks</th>
                <th className="py-2 pr-4 font-medium">Planned MD</th>
                <th className="py-2 pr-4 font-medium">Actual MD</th>
                <th className="py-2 pr-4 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
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
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{r.department}</td>
                  <td className="py-2 pr-4">{r.projectCount}</td>
                  <td className="py-2 pr-4">{r.taskCount}</td>
                  <td className="py-2 pr-4">{r.plannedMd}</td>
                  <td className="py-2 pr-4">{r.actualMd}</td>
                  <td className="py-2 pr-4">
                    <ResourceUtilizationBar percent={r.utilization} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
