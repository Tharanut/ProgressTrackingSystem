import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { RoleGuard } from "@/components/RoleGuard";
import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { RemoveMemberButton } from "@/components/forms/RemoveMemberButton";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type RawMemberRow = {
  id: string;
  project_role: string | null;
  responsibility: string | null;
  planned_man_day: number;
  actual_man_day: number;
  user_id: string;
  employee: { full_name: string } | null;
};

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, project_code, project_name")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const [{ data: memberData }, { data: profiles }] = await Promise.all([
    supabase
      .from("project_members")
      .select(
        "id, project_role, responsibility, planned_man_day, actual_man_day, user_id, employee:profiles(full_name)",
      )
      .eq("project_id", id),
    supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
  ]);

  const members = (memberData ?? []) as unknown as RawMemberRow[];
  const memberIds = new Set(members.map((m) => m.user_id));
  const candidates = (profiles ?? []).filter((p) => !memberIds.has(p.id));

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
          <span>Members</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold">Members — {project.project_name}</h1>

        <section className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">ยังไม่มีสมาชิกใน Project นี้</p>
          ) : (
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Project Role</th>
                  <th className="py-2 pr-4 font-medium">Responsibility</th>
                  <th className="py-2 pr-4 font-medium">Planned MD</th>
                  <th className="py-2 pr-4 font-medium">Actual MD</th>
                  <th className="py-2 pr-4 font-medium">Utilization</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <RoleGuard role={profile.role} allow={["admin", "pm"]}>
                    <th className="py-2 pr-4 font-medium" />
                  </RoleGuard>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const planned = Number(m.planned_man_day);
                  const actual = Number(m.actual_man_day);
                  const utilization = planned > 0 ? Math.round((actual / planned) * 100) : 0;
                  const overload = utilization > 100;
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="py-2 pr-4 font-medium">{m.employee?.full_name ?? "-"}</td>
                      <td className="py-2 pr-4">{m.project_role ?? "-"}</td>
                      <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                        {m.responsibility ?? "-"}
                      </td>
                      <td className="py-2 pr-4">{planned}</td>
                      <td className="py-2 pr-4">{actual}</td>
                      <td className="py-2 pr-4">{planned > 0 ? `${utilization}%` : "-"}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            overload
                              ? "inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }
                        >
                          {overload ? "Overload" : "Normal"}
                        </span>
                      </td>
                      <RoleGuard role={profile.role} allow={["admin", "pm"]}>
                        <td className="py-2 pr-4">
                          <RemoveMemberButton id={m.id} projectId={id} />
                        </td>
                      </RoleGuard>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <RoleGuard role={profile.role} allow={["admin", "pm"]}>
          <h2 className="mt-10 text-lg font-semibold">เพิ่มสมาชิก</h2>
          <div className="mt-3">
            <AddMemberForm projectId={id} candidates={candidates} />
          </div>
        </RoleGuard>
      </main>
    </>
  );
}
