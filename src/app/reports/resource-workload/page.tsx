import { AppNav } from "@/components/AppNav";
import { ExportButton } from "@/components/ExportButton";
import { requireProfile } from "@/lib/auth";
import { isOverload, utilizationPercent } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/server";

export default async function ResourceWorkloadReportPage() {
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

  const rows = profileRows.map((p) => {
    const own = (members ?? []).filter((m) => m.user_id === p.id);
    const plannedMd = own.reduce((sum, m) => sum + Number(m.planned_man_day), 0);
    const actualMd = own.reduce((sum, m) => sum + Number(m.actual_man_day), 0);
    const utilization = utilizationPercent(plannedMd, actualMd);
    return {
      employee_code: p.employee_code ?? "-",
      full_name: p.full_name,
      department: p.departments?.department_name ?? "-",
      projects: new Set(own.map((m) => m.project_id)).size,
      tasks: (tasks ?? []).filter((t) => t.assigned_to === p.id).length,
      planned_man_day: plannedMd,
      actual_man_day: actualMd,
      utilization_percent: utilization,
      status: isOverload(utilization) ? "Overload" : "Normal",
    };
  });

  const columns = [
    { key: "employee_code", label: "Employee Code" },
    { key: "full_name", label: "Employee" },
    { key: "department", label: "Department" },
    { key: "projects", label: "Projects" },
    { key: "tasks", label: "Tasks" },
    { key: "planned_man_day", label: "Planned MD" },
    { key: "actual_man_day", label: "Actual MD" },
    { key: "utilization_percent", label: "Utilization %" },
    { key: "status", label: "Status" },
  ];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resource Workload Report</h1>
            <p className="mt-1 text-sm text-slate-500">Workload และ Utilization ของพนักงานทุกคน</p>
          </div>
          <ExportButton
            columns={columns}
            rows={rows}
            filename="resource-workload"
            title="Resource Workload Report"
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                {columns.map((c) => (
                  <th key={c.key} className="py-2 pr-4 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.employee_code + r.full_name}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-900"
                >
                  <td className="py-2 pr-4">{r.employee_code}</td>
                  <td className="py-2 pr-4 font-medium">{r.full_name}</td>
                  <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{r.department}</td>
                  <td className="py-2 pr-4">{r.projects}</td>
                  <td className="py-2 pr-4">{r.tasks}</td>
                  <td className="py-2 pr-4">{r.planned_man_day}</td>
                  <td className="py-2 pr-4">{r.actual_man_day}</td>
                  <td className="py-2 pr-4">{r.utilization_percent}%</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        r.status === "Overload"
                          ? "inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }
                    >
                      {r.status}
                    </span>
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
