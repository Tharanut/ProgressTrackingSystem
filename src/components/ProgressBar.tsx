export function ProgressBar({ percent }: { percent: number }) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  const tone = value >= 100 ? "bg-emerald-500" : value >= 50 ? "bg-sky-500" : "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 shrink-0 text-xs text-slate-500">{value}%</span>
    </div>
  );
}
