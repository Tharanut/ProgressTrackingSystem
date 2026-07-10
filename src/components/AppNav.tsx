import Link from "next/link";

import { logout } from "@/lib/auth-actions";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile } from "@/lib/auth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/resources", label: "Resources" },
  { href: "/reports", label: "Reports" },
  { href: "/time-logs", label: "Time Logs" },
];

const ADMIN_LINKS = [{ href: "/employees", label: "Employees" }];

export function AppNav({ profile }: { profile: Profile }) {
  const links = profile.role === "admin" ? [...LINKS, ...ADMIN_LINKS] : LINKS;

  return (
    <header className="border-b border-sky-900 bg-gradient-to-r from-sky-900 to-sky-800 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-white">
            ProjectPulse
          </Link>
          <nav className="flex gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sky-100 hover:text-white dark:text-slate-300 dark:hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-sky-200">
            {profile.full_name} · {ROLE_LABELS[profile.role]}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-sky-600 px-3 py-1.5 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
