import type { Database } from "@/lib/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type TaskStatus = Database["public"]["Enums"]["task_status"];
type PriorityLevel = Database["public"]["Enums"]["priority_level"];

/** 1 Man-Day = 8 working hours (Business Rule §2.5). */
export const MAN_DAY_HOURS = 8;

/** Login email convention: <username>@<domain> (username -> Supabase Auth email). */
export const LOGIN_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN ?? "projectpulse.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  pm: "Project Manager",
  member: "Team Member",
  management: "Management",
  viewer: "Viewer",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  delayed: "Delayed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  delayed: "Delayed",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
