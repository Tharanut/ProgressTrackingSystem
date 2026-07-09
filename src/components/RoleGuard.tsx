import type { UserRole } from "@/lib/auth";

/** Renders `children` only when `role` is in the `allow` list — used to hide actions a role can't perform. */
export function RoleGuard({
  role,
  allow,
  children,
}: {
  role: UserRole;
  allow: UserRole[];
  children: React.ReactNode;
}) {
  if (!allow.includes(role)) return null;
  return <>{children}</>;
}
