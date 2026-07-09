"use client";

import { useState } from "react";

import { exportToCsv, exportToExcel, exportToPdf, type ExportColumn, type ExportRow } from "@/lib/export";

export function ExportButton({
  columns,
  rows,
  filename,
  title,
}: {
  columns: ExportColumn[];
  rows: ExportRow[];
  filename: string;
  title: string;
}) {
  const [busy, setBusy] = useState<"csv" | "excel" | "pdf" | null>(null);

  async function handle(format: "csv" | "excel" | "pdf") {
    setBusy(format);
    try {
      if (format === "csv") exportToCsv(columns, rows, filename);
      else if (format === "excel") exportToExcel(columns, rows, filename);
      else await exportToPdf(columns, rows, filename, title);
    } finally {
      setBusy(null);
    }
  }

  const btnClass =
    "rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800";

  return (
    <div className="flex gap-2">
      <button type="button" disabled={busy !== null} onClick={() => handle("excel")} className={btnClass}>
        {busy === "excel" ? "..." : "Export Excel"}
      </button>
      <button type="button" disabled={busy !== null} onClick={() => handle("pdf")} className={btnClass}>
        {busy === "pdf" ? "..." : "Export PDF"}
      </button>
      <button type="button" disabled={busy !== null} onClick={() => handle("csv")} className={btnClass}>
        {busy === "csv" ? "..." : "Export CSV"}
      </button>
    </div>
  );
}
