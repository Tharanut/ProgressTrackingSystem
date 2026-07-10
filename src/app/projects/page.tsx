import { AppNav } from "@/components/AppNav";
import { ProjectTable, type ProjectRow } from "@/components/ProjectTable";
import { RoleGuard } from "@/components/RoleGuard";
import { NewProjectForm } from "@/components/forms/NewProjectForm";
import { canManageProjects, requireProfile } from "@/lib/auth";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

type RawProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  status: ProjectRow["status"];
  progress_percent: number;
  planned_man_day: number;
  actual_man_day: number;
  owner: { full_name: string } | null;
  project_members: { count: number }[];
};

function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%]/g, " ").trim();
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const profile = await requireProfile();
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(
      `id, project_code, project_name, status, progress_percent, planned_man_day, actual_man_day,
       owner:profiles!projects_project_owner_id_fkey(full_name),
       project_members(count)`,
    )
    .order("created_at", { ascending: false });

  const search = q ? sanitizeSearchTerm(q) : "";
  if (search) {
    query = query.or(`project_name.ilike.%${search}%,project_code.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status as ProjectRow["status"]);
  }

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawProjectRow[];

  const projects: ProjectRow[] = rows.map((p) => ({
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

  const [{ data: profiles }, { data: departments }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
    supabase.from("departments").select("id, department_name").order("department_name"),
  ]);

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Projects</h1>

        <form className="mt-4 flex flex-wrap gap-3" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ค้นหา Project Code / Name"
            className="w-64 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700"
          >
            <option value="">ทุกสถานะ</option>
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            กรอง
          </button>
        </form>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ProjectTable projects={projects} />
        </section>

        <RoleGuard role={profile.role} allow={["admin", "pm"]}>
          <h2 className="mt-10 text-lg font-semibold">สร้าง Project ใหม่</h2>
          <div className="mt-3">
            <NewProjectForm profiles={profiles ?? []} departments={departments ?? []} />
          </div>
        </RoleGuard>

        {!canManageProjects(profile.role) && (
          <p className="mt-8 text-center text-xs text-slate-400">
            บทบาทของคุณสามารถดูข้อมูล Project ได้อย่างเดียว
          </p>
        )}
      </main>
    </>
  );
}
