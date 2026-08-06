// components/export/export.utils.js

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Normalize rows for export.
 * Accepts either:
 * - array of plain objects (keys become headers), or
 * - { columns: [{ key, label }], rows: [...] }
 */
function buildSheetData(data, columns) {
  if (columns?.length) {
    return (data || []).map((row) => {
      const next = {};
      columns.forEach((column) => {
        const label = column.label || column.key;
        const value =
          typeof column.accessor === "function"
            ? column.accessor(row)
            : row[column.key];
        next[label] = value ?? "";
      });
      return next;
    });
  }

  return (data || []).map((row) => {
    const next = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      next[key] = value ?? "";
    });
    return next;
  });
}

/**
 * Export tabular data to Excel (.xlsx).
 */
export function exportToExcel(
  data = [],
  {
    filename = "export.xlsx",
    sheetName = "Sheet1",
    columns,
  } = {}
) {
  const rows = buildSheetData(data, columns);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/**
 * Export tabular data to CSV.
 */
export function exportToCsv(
  data = [],
  {
    filename = "export.csv",
    columns,
  } = {}
) {
  const rows = buildSheetData(data, columns);
  const headers =
    columns?.length > 0
      ? columns.map((column) => column.label || column.key)
      : rows.length > 0
        ? Object.keys(rows[0])
        : [];

  const escapeCsv = (value) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(",")
    ),
  ];

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export tabular data to PDF.
 */
export function exportToPdf(
  data = [],
  {
    filename = "export.pdf",
    title = "DIS-SMS Export",
    columns,
    orientation = "landscape",
  } = {}
) {
  const rows = buildSheetData(data, columns);
  const doc = new jsPDF({ orientation });

  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Exported ${new Date().toLocaleString()} · ${rows.length} record(s)`,
    14,
    22
  );

  const headers =
    columns?.length > 0
      ? columns.map((column) => column.label || column.key)
      : rows.length > 0
        ? Object.keys(rows[0])
        : [];

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows.map((row) => headers.map((header) => row[header] ?? "")),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  doc.save(filename);
}

/**
 * Open a printable HTML table for the current data set.
 */
export function printData(
  data = [],
  {
    title = "DIS-SMS Print",
    columns,
  } = {}
) {
  const rows = buildSheetData(data, columns);
  const headers =
    columns?.length > 0
      ? columns.map((column) => column.label || column.key)
      : rows.length > 0
        ? Object.keys(rows[0])
        : [];

  const tableHead = headers
    .map(
      (header) =>
        `<th style="text-align:left;padding:8px;border-bottom:1px solid #cbd5e1;">${escapeHtml(header)}</th>`
    )
    .join("");

  const tableBody = rows
    .map((row) => {
      const cells = headers
        .map(
          (header) =>
            `<td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(String(row[header] ?? ""))}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  // Do not pass "noopener" here — modern browsers return null and print cannot run.
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Unable to open print window. Check popup blocker settings.");
  }
  printWindow.opener = null;

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
      h1 { font-size: 18px; margin: 0 0 8px; }
      p { font-size: 12px; color: #64748b; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>Printed ${new Date().toLocaleString()} · ${rows.length} record(s)</p>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableBody}</tbody>
    </table>
  </body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
