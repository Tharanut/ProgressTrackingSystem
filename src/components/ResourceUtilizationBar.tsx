/** Like ProgressBar, but supports >100% (overload) with a distinct red fill. */
export function ResourceUtilizationBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, percent);
  const overload = percent > 100;
  const tone = overload ? "bg-red-500" : percent >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full ${tone}`} style={{ width: `${clamped}%` }} />
      </div>
      <span
        className={`w-12 shrink-0 text-xs ${overload ? "font-semibold text-red-600 dark:text-red-400" : "text-slate-500"}`}
      >
        {Math.round(percent)}%
      </span>
    </div>
  );
}
