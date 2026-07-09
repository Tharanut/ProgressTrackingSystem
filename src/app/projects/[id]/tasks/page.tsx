import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { RoleGuard } from "@/components/RoleGuard";
import { TaskTable, type TaskRow } from "@/components/TaskTable";
import { NewTaskForm } from "@/components/forms/NewTaskForm";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type RawTaskRow = {
  id: string;
  task_name: string;
  status: TaskRow["status"];
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  planned_end_date: string | null;
  assignee: { full_name: string } | null;
};

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, project_code, project_name")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const [{ data: taskData }, { data: profiles }] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        `id, task_name, status, progress_percent, planned_man_day, actual_man_day, planned_end_date,
         assignee:profiles!tasks_assigned_to_fkey(full_name)`,
      )
      .eq("project_id", id)
      .order("created_at"),
    supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
  ]);

  const tasks: TaskRow[] = ((taskData ?? []) as unknown as RawTaskRow[]).map((t) => ({
    id: t.id,
    task_name: t.task_name,
    status: t.status,
    progress_percent: Number(t.progress_percent),
    planned_man_day: Number(t.planned_man_day),
    actual_man_day: Number(t.actual_man_day),
    planned_end_date: t.planned_end_date,
    assigned_name: t.assignee?.full_name ?? null,
  }));

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:underline">
            {project.project_code}
          </Link>
          <span>/</span>
          <span>Tasks</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold">Tasks — {project.project_name}</h1>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <TaskTable projectId={id} tasks={tasks} />
        </section>

        <RoleGuard role={profile.role} allow={["admin", "pm"]}>
          <h2 className="mt-10 text-lg font-semibold">สร้าง Task ใหม่</h2>
          <div className="mt-3">
            <NewTaskForm projectId={id} members={profiles ?? []} />
          </div>
        </RoleGuard>
      </main>
    </>
  );
}
