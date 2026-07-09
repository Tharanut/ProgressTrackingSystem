import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { TaskStatusBadge } from "@/components/StatusBadge";
import { DeleteTimeLogButton } from "@/components/forms/DeleteTimeLogButton";
import { EditTaskForm } from "@/components/forms/EditTaskForm";
import { QuickTimeLogForm } from "@/components/forms/QuickTimeLogForm";
import { canManageProjects, requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type RawTimeLogRow = {
  id: string;
  work_date: string;
  work_hour: number;
  work_detail: string | null;
  issue_blocker: string | null;
  user_id: string;
  employee: { full_name: string } | null;
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const profile = await requireProfile();
  const { id, taskId } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: task }] = await Promise.all([
    supabase.from("projects").select("id, project_code, project_name").eq("id", id).single(),
    supabase.from("tasks").select("*").eq("id", taskId).single(),
  ]);
  if (!project || !task || task.project_id !== id) notFound();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  const { data: logData } = await supabase
    .from("time_logs")
    .select(
      "id, work_date, work_hour, work_detail, issue_blocker, user_id, employee:profiles(full_name)",
    )
    .eq("task_id", taskId)
    .order("work_date", { ascending: false });
  const logs = (logData ?? []) as unknown as RawTimeLogRow[];

  const canEditAll = canManageProjects(profile.role);
  const isOwnTask = profile.role === "member" && task.assigned_to === profile.id;

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
          <Link href={`/projects/${id}/tasks`} className="hover:underline">
            Tasks
          </Link>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{task.task_name}</h1>
          <TaskStatusBadge status={task.status} />
        </div>

        {(canEditAll || isOwnTask) && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">แก้ไข Task</h2>
            <div className="mt-3">
              <EditTaskForm task={task} members={profiles ?? []} canEditAll={canEditAll} />
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold">บันทึกเวลาทำงาน</h2>
          <div className="mt-3">
            <QuickTimeLogForm projectId={id} taskId={taskId} />
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {logs.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500">ยังไม่มีรายการเวลาทำงาน</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Employee</th>
                    <th className="py-2 pr-4 font-medium">Hours</th>
                    <th className="py-2 pr-4 font-medium">Detail</th>
                    <th className="py-2 pr-4 font-medium">Issue</th>
                    <th className="py-2 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="py-2 pr-4">{l.work_date}</td>
                      <td className="py-2 pr-4">{l.employee?.full_name ?? "-"}</td>
                      <td className="py-2 pr-4">{l.work_hour}</td>
                      <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                        {l.work_detail ?? "-"}
                      </td>
                      <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                        {l.issue_blocker ?? "-"}
                      </td>
                      <td className="py-2 pr-4">
                        {(l.user_id === profile.id || profile.role === "admin") && (
                          <DeleteTimeLogButton id={l.id} />
                        )}
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
