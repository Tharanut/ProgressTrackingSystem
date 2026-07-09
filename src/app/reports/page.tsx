import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { requireProfile } from "@/lib/auth";

const REPORTS = [
  {
    href: "/reports/project-summary",
    title: "Project Summary Report",
    desc: "Progress, Planned/Actual Man-Day, Cost และ Variance ของทุก Project (รวม Planned vs Actual และ Man-Day Report)",
  },
  {
    href: "/reports/resource-workload",
    title: "Resource Workload Report",
    desc: "Workload และ Utilization ของพนักงานแต่ละคนในทุก Project",
  },
  {
    href: "/reports/cost",
    title: "Cost Report",
    desc: "Planned vs Actual Cost แยกตาม Project และตามพนักงาน",
  },
];

export default async function ReportsPage() {
  const profile = await requireProfile();

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          รายงานทั้งหมด Export เป็น Excel / PDF / CSV ได้ · Task Progress Report ดูได้ที่หน้า Tasks
          ของแต่ละ Project
        </p>

        <div className="mt-6 grid gap-4">
          {REPORTS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
            >
              <h2 className="font-semibold text-indigo-600 dark:text-indigo-400">{r.title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
