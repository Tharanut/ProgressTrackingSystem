/** GET-form date range filter — reads `from`/`to` as URL search params (works with any Server Component page). */
export function DateRangeFilter({ from, to }: { from?: string; to?: string }) {
  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <div>
        <label className="block text-xs text-slate-500">Planned Start จาก</label>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="mt-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500">ถึง</label>
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="mt-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        กรองตามช่วงเวลา
      </button>
    </form>
  );
}
