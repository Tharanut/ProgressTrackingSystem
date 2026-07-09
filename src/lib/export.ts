export type ExportColumn = { key: string; label: string };
export type ExportRow = Record<string, string | number | null | undefined>;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function cellText(value: ExportRow[string]): string {
  return value === null || value === undefined ? "" : String(value);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportToCsv(columns: ExportColumn[], rows: ExportRow[], filename: string) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(cellText(row[c.key]))).join(","),
  );
  // UTF-8 BOM so Excel/Thai characters render correctly when opening the CSV directly.
  const blob = new Blob(["﻿", [header, ...lines].join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/**
 * "Excel export" without a native .xlsx library: an HTML table saved with a
 * `.xls` extension + the classic `application/vnd.ms-excel` MIME type, which
 * Excel opens natively as a formatted spreadsheet. Avoids the `xlsx` npm
 * package's unresolved prototype-pollution/ReDoS advisories (GHSA-4r6h-8v6p-xvw6,
 * GHSA-5pgg-2g8v-p4x9) since we only ever write our own trusted data, never parse.
 */
export function exportToExcel(columns: ExportColumn[], rows: ExportRow[], filename: string) {
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(cellText(row[c.key]))}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `<html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  triggerDownload(blob, filename.endsWith(".xls") ? filename : `${filename}.xls`);
}

export async function exportToPdf(
  columns: ExportColumn[],
  rows: ExportRow[],
  filename: string,
  title: string,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  autoTable(doc, {
    startY: 20,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => cellText(row[c.key]))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
