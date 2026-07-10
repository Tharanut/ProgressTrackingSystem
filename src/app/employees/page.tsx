import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { RoleGuard } from "@/components/RoleGuard";
import { NewEmployeeForm } from "@/components/forms/NewEmployeeForm";
import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type UserRole = Database["public"]["Enums"]["user_role"];

type RawEmployeeRow = {
  id: string;
  employee_code: string | null;
  username: string;
  full_name: string;
  role: UserRole;
  cost_rate_per_day: number;
  is_active: boolean;
  departments: { department_name: string } | null;
};

export default async function EmployeesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: employees }, { data: departments }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, employee_code, username, full_name, role, cost_rate_per_day, is_active, departments(department_name)",
      )
      .order("employee_code"),
    supabase.from("departments").select("id, department_name").order("department_name"),
  ]);

  const rows = (employees ?? []) as unknown as RawEmployeeRow[];

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Employees</h1>

        <section className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีข้อมูลพนักงาน</p>
          ) : (
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="py-2 pr-4 font-medium">Code</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Username</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Cost/Day</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-900"
                  >
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                      {r.employee_code ?? "-"}
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      <Link
                        href={`/employees/${r.id}`}
                        className="text-sky-600 hover:underline dark:text-sky-400"
                      >
                        {r.full_name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{r.username}</td>
                    <td className="py-2 pr-4">{r.departments?.department_name ?? "-"}</td>
                    <td className="py-2 pr-4">{ROLE_LABELS[r.role]}</td>
                    <td className="py-2 pr-4">{Number(r.cost_rate_per_day).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          r.is_active
                            ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <RoleGuard role={profile.role} allow={["admin"]}>
          <h2 className="mt-10 text-lg font-semibold">เพิ่มพนักงานใหม่</h2>
          <div className="mt-3">
            <NewEmployeeForm departments={departments ?? []} />
          </div>
        </RoleGuard>

        {profile.role !== "admin" && (
          <p className="mt-8 text-center text-xs text-slate-400">
            บทบาทของคุณสามารถดูข้อมูลพนักงานได้อย่างเดียว
          </p>
        )}
      </main>
    </>
  );
}
