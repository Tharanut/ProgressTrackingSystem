import { AppNav } from "@/components/AppNav";
import { DeleteTimeLogButton } from "@/components/forms/DeleteTimeLogButton";
import { NewTimeLogForm } from "@/components/forms/NewTimeLogForm";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type RawMyLogRow = {
  id: string;
  work_date: string;
  work_hour: number;
  work_detail: string | null;
  issue_blocker: string | null;
  project: { project_code: string; project_name: string } | null;
  task: { task_name: string } | null;
};

export default async function TimeLogsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: projects }, { data: tasks }, { data: myLogsData }] = await Promise.all([
    supabase.from("projects").select("id, project_code, project_name").order("project_code"),
    supabase.from("tasks").select("id, project_id, task_name").order("task_name"),
    supabase
      .from("time_logs")
      .select(
        `id, work_date, work_hour, work_detail, issue_blocker,
         project:projects(project_code, project_name),
         task:tasks(task_name)`,
      )
      .eq("user_id", profile.id)
      .order("work_date", { ascending: false })
      .limit(30),
  ]);

  const myLogs = (myLogsData ?? []) as unknown as RawMyLogRow[];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Time Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          บันทึกเวลาทำงานจริงของคุณ (Actual Man-Day = ชั่วโมง / 8)
        </p>

        <div className="mt-6">
          <NewTimeLogForm projects={projects ?? []} tasks={tasks ?? []} />
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">รายการล่าสุดของฉัน</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {myLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีรายการ</p>
            ) : (
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Project</th>
                    <th className="py-2 pr-4 font-medium">Task</th>
                    <th className="py-2 pr-4 font-medium">Hours</th>
                    <th className="py-2 pr-4 font-medium">Detail</th>
                    <th className="py-2 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {myLogs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-900"
                    >
                      <td className="py-2 pr-4">{l.work_date}</td>
                      <td className="py-2 pr-4">{l.project?.project_code ?? "-"}</td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                        {l.task?.task_name ?? "-"}
                      </td>
                      <td className="py-2 pr-4">{l.work_hour}</td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                        {l.work_detail ?? "-"}
                      </td>
                      <td className="py-2 pr-4">
                        <DeleteTimeLogButton id={l.id} />
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
