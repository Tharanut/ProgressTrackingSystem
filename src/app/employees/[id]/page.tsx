import Link from "next/link";
import { notFound } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { RoleGuard } from "@/components/RoleGuard";
import { EditEmployeeForm } from "@/components/forms/EditEmployeeForm";
import { ToggleEmployeeActiveButton } from "@/components/forms/ToggleEmployeeActiveButton";
import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!employee) notFound();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, department_name")
    .order("department_name");

  return (
    <>
      <AppNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/employees" className="hover:underline">
                Employees
              </Link>
              <span>/</span>
              <span>{employee.employee_code ?? employee.username}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold">{employee.full_name}</h1>
          </div>
          <RoleGuard role={profile.role} allow={["admin"]}>
            <ToggleEmployeeActiveButton id={employee.id} isActive={employee.is_active} />
          </RoleGuard>
        </div>

        <section className="mt-8">
          <RoleGuard role={profile.role} allow={["admin"]}>
            <div className="mt-3">
              <EditEmployeeForm employee={employee} departments={departments ?? []} />
            </div>
          </RoleGuard>
          {profile.role !== "admin" && (
            <dl className="mt-3 grid gap-x-8 gap-y-2 rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
              <Row label="Username" value={employee.username} />
              <Row label="Employee Code" value={employee.employee_code} />
              <Row label="Role" value={ROLE_LABELS[employee.role]} />
              <Row label="Cost Rate / Day" value={String(employee.cost_rate_per_day)} />
              <Row label="Status" value={employee.is_active ? "Active" : "Inactive"} />
            </dl>
          )}
        </section>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value ?? "-"}</dd>
    </div>
  );
}
