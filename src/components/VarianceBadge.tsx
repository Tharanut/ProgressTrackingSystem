import { variance } from "@/lib/metrics";

/** Shows Actual vs Planned as a colored "+/- value (percent%)" chip. Higher actual is always "worse" (red). */
export function VarianceBadge({
  planned,
  actual,
  unit = "",
  decimals = 2,
}: {
  planned: number;
  actual: number;
  unit?: string;
  decimals?: number;
}) {
  const { variance: v, variancePercent } = variance(planned, actual);
  const overPlan = v > 0;
  const tone =
    v === 0
      ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      : overPlan
        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

  const sign = v > 0 ? "+" : "";
  const pctText = variancePercent === null ? "" : ` (${sign}${variancePercent.toFixed(0)}%)`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {sign}
      {v.toFixed(decimals)}
      {unit ? ` ${unit}` : ""}
      {pctText}
    </span>
  );
}
