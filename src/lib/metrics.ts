/** Shared Planned-vs-Actual calculation helpers (§9.4 Business Rules). */

export type Variance = { variance: number; variancePercent: number | null };

export function variance(planned: number, actual: number): Variance {
  const v = actual - planned;
  return { variance: v, variancePercent: planned !== 0 ? (v / planned) * 100 : null };
}

/** Utilization % = Actual Man-Day / Planned Man-Day × 100. */
export function utilizationPercent(planned: number, actual: number): number {
  return planned > 0 ? Math.round((actual / planned) * 100) : 0;
}

export function isOverload(utilization: number): boolean {
  return utilization > 100;
}

/** Remaining capacity relative to what's already planned for this person (0 when overloaded). */
export function capacityRemainingPercent(utilization: number): number {
  return Math.max(0, 100 - utilization);
}

/** Days between two ISO date strings (inclusive-ish; null when either side is missing). */
export function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function isProjectOverdue(
  plannedEndDate: string | null,
  progressPercent: number,
  todayIso: string,
): boolean {
  if (!plannedEndDate) return false;
  return plannedEndDate < todayIso && progressPercent < 100;
}
