import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { DashboardCard } from "@/components/DashboardCard";
import { ProgressBar } from "@/components/ProgressBar";
import { RoleGuard } from "@/components/RoleGuard";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { EditProjectForm } from "@/components/forms/EditProjectForm";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const [{ data: profiles }, { data: departments }, { data: owner }, { data: department }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
      supabase.from("departments").select("id, department_name").order("department_name"),
      project.project_owner_id
        ? supabase.from("profiles").select("full_name").eq("id", project.project_owner_id).single()
        : Promise.resolve({ data: null }),
      project.department_id
        ? supabase.from("departments").select("department_name").eq("id", project.department_id).single()
        : Promise.resolve({ data: null }),
    ]);

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/projects" className="hover:underline">
                Projects
              </Link>
              <span>/</span>
              <span>{project.project_code}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold">{project.project_name}</h1>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <Link href={`/projects/${id}/tasks`} className="text-indigo-600 hover:underline dark:text-indigo-400">
            Tasks →
          </Link>
          <Link href={`/projects/${id}/members`} className="text-indigo-600 hover:underline dark:text-indigo-400">
            Members →
          </Link>
          <Link
            href={`/projects/${id}/planned-vs-actual`}
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Planned vs Actual →
          </Link>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DashboardCard label="Progress" value={`${Number(project.progress_percent)}%`} />
          <DashboardCard label="Planned MD" value={Number(project.planned_man_day)} />
          <DashboardCard label="Actual MD" value={Number(project.actual_man_day)} />
          <DashboardCard
            label="MD Variance"
            value={(Number(project.actual_man_day) - Number(project.planned_man_day)).toFixed(2)}
            tone={
              Number(project.actual_man_day) > Number(project.planned_man_day) ? "danger" : "success"
            }
          />
        </section>

        <div className="mt-4">
          <ProgressBar percent={Number(project.progress_percent)} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Overview</h2>
          <RoleGuard role={profile.role} allow={["admin", "pm"]}>
            <div className="mt-3">
              <EditProjectForm project={project} profiles={profiles ?? []} departments={departments ?? []} />
            </div>
          </RoleGuard>
          {profile.role !== "admin" && profile.role !== "pm" && (
            <dl className="mt-3 grid gap-x-8 gap-y-2 rounded-xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
              <Row label="Owner" value={owner?.full_name} />
              <Row label="Department" value={department?.department_name} />
              <Row label="Planned Start" value={project.planned_start_date} />
              <Row label="Planned End" value={project.planned_end_date} />
              <Row label="Actual Start" value={project.actual_start_date} />
              <Row label="Actual End" value={project.actual_end_date} />
              <Row label="Priority" value={project.priority} />
              <Row label="Description" value={project.description} />
            </dl>
          )}
        </section>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-zinc-100 py-1 dark:border-zinc-800">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium">{value ?? "-"}</dd>
    </div>
  );
}
