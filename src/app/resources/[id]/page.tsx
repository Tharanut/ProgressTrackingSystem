import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { DashboardCard } from "@/components/DashboardCard";
import { ProgressBar } from "@/components/ProgressBar";
import { ResourceUtilizationBar } from "@/components/ResourceUtilizationBar";
import { TaskStatusBadge } from "@/components/StatusBadge";
import { ROLE_LABELS } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { utilizationPercent } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/server";

type RawMembership = {
  project_id: string;
  project_role: string | null;
  planned_man_day: number;
  actual_man_day: number;
  project: { project_code: string; project_name: string } | null;
};

type RawTask = {
  id: string;
  task_name: string;
  status: string;
  progress_percent: number;
  project_id: string;
  project: { project_code: string } | null;
};

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: person } = await supabase
    .from("profiles")
    .select("*, departments(department_name)")
    .eq("id", id)
    .single();
  if (!person) notFound();

  const [{ data: membershipData }, { data: taskData }] = await Promise.all([
    supabase
      .from("project_members")
      .select("project_id, project_role, planned_man_day, actual_man_day, project:projects(project_code, project_name)")
      .eq("user_id", id),
    supabase
      .from("tasks")
      .select("id, task_name, status, progress_percent, project_id, project:projects(project_code)")
      .eq("assigned_to", id)
      .order("created_at", { ascending: false }),
  ]);

  const memberships = (membershipData ?? []) as unknown as RawMembership[];
  const tasks = (taskData ?? []) as unknown as RawTask[];

  const plannedMd = memberships.reduce((sum, m) => sum + Number(m.planned_man_day), 0);
  const actualMd = memberships.reduce((sum, m) => sum + Number(m.actual_man_day), 0);
  const utilization = utilizationPercent(plannedMd, actualMd);

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/resources" className="hover:underline">
            Resources
          </Link>
          <span>/</span>
          <span>{person.full_name}</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold">{person.full_name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {ROLE_LABELS[person.role]} · {person.departments?.department_name ?? "-"} ·{" "}
          {person.employee_code ?? "-"}
        </p>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DashboardCard label="Projects" value={memberships.length} />
          <DashboardCard label="Tasks" value={tasks.length} />
          <DashboardCard label="Planned MD" value={plannedMd} />
          <DashboardCard label="Actual MD" value={actualMd} />
        </section>

        <div className="mt-4">
          <ResourceUtilizationBar percent={utilization} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {memberships.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">ยังไม่มี Project</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Project</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">Planned MD</th>
                    <th className="py-2 pr-4 font-medium">Actual MD</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m) => (
                    <tr key={m.project_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/projects/${m.project_id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {m.project?.project_code} · {m.project?.project_name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{m.project_role ?? "-"}</td>
                      <td className="py-2 pr-4">{m.planned_man_day}</td>
                      <td className="py-2 pr-4">{m.actual_man_day}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">ยังไม่มี Task</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Task</th>
                    <th className="py-2 pr-4 font-medium">Progress</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/projects/${t.project_id}/tasks/${t.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {t.project?.project_code} · {t.task_name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        <ProgressBar percent={Number(t.progress_percent)} />
                      </td>
                      <td className="py-2 pr-4">
                        <TaskStatusBadge status={t.status as "pending" | "in_progress" | "done" | "delayed"} />
                      </td>
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
