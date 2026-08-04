import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export helpers for the Teachers directory.
 */

function toExportRows(teachers = []) {
  return teachers.map((teacher) => ({
    Name: teacher.name ?? "",
    "Staff No": teacher.staffNo ?? "",
    Department: teacher.department ?? "",
    Gender: teacher.gender ?? "",
    Status: teacher.status ?? "",
    Phone: teacher.phone ?? "",
    Email: teacher.email ?? "",
    Qualification: teacher.qualification ?? "",
  }));
}

export function exportTeachersToExcel(teachers, filename = "teachers.xlsx") {
  const rows = toExportRows(teachers);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
  XLSX.writeFile(workbook, filename);
}

export function exportTeachersToPdf(teachers, filename = "teachers.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  const rows = toExportRows(teachers);

  doc.setFontSize(14);
  doc.text("DIS-SMS Teachers Directory", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Exported ${new Date().toLocaleString()} · ${rows.length} record(s)`,
    14,
    22
  );

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Name",
        "Staff No",
        "Department",
        "Gender",
        "Status",
        "Phone",
        "Email",
        "Qualification",
      ],
    ],
    body: rows.map((row) => [
      row.Name,
      row["Staff No"],
      row.Department,
      row.Gender,
      row.Status,
      row.Phone,
      row.Email,
      row.Qualification,
    ]),
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
