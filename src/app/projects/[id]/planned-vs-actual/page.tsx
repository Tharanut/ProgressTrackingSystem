import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { VarianceBadge } from "@/components/VarianceBadge";
import { requireProfile } from "@/lib/auth";
import { daysBetween } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/server";

export default async function PlannedVsActualPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const plannedDuration = daysBetween(project.planned_start_date, project.planned_end_date);
  const actualDuration = project.actual_start_date
    ? daysBetween(project.actual_start_date, project.actual_end_date ?? today)
    : null;

  const rows = [
    {
      item: "Duration (Days)",
      planned: plannedDuration,
      actual: actualDuration,
      unit: "Days",
      decimals: 0,
    },
    {
      item: "Man-Day",
      planned: Number(project.planned_man_day),
      actual: Number(project.actual_man_day),
      unit: "MD",
      decimals: 2,
    },
    {
      item: "Cost",
      planned: Number(project.planned_cost),
      actual: Number(project.actual_cost),
      unit: "",
      decimals: 0,
    },
  ];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:underline">
            {project.project_code}
          </Link>
          <span>/</span>
          <span>Planned vs Actual</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold">Planned vs Actual — {project.project_name}</h1>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 font-medium">Planned</th>
                <th className="py-2 pr-4 font-medium">Actual</th>
                <th className="py-2 pr-4 font-medium">Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.item}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="py-2 pr-4 font-medium">{r.item}</td>
                  <td className="py-2 pr-4">
                    {r.planned === null
                      ? "-"
                      : `${r.planned.toLocaleString(undefined, { maximumFractionDigits: r.decimals })}${r.unit ? ` ${r.unit}` : ""}`}
                  </td>
                  <td className="py-2 pr-4">
                    {r.actual === null
                      ? "-"
                      : `${r.actual.toLocaleString(undefined, { maximumFractionDigits: r.decimals })}${r.unit ? ` ${r.unit}` : ""}`}
                  </td>
                  <td className="py-2 pr-4">
                    {r.planned === null || r.actual === null ? (
                      <span className="text-xs text-zinc-400">ยังไม่เริ่ม</span>
                    ) : (
                      <VarianceBadge
                        planned={r.planned}
                        actual={r.actual}
                        unit={r.unit}
                        decimals={r.decimals}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Duration Actual คำนวณจาก Actual Start Date ถึง Actual End Date (หรือถึงวันนี้ถ้ายังไม่จบ)
        </p>
      </main>
    </>
  );
}
