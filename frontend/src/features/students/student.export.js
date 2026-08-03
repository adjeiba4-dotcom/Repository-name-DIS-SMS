import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export helpers for the Students directory.
 */

function toExportRows(students = []) {
  return students.map((student) => ({
    Name: student.name ?? "",
    "Admission No": student.studentId ?? "",
    Class: student.className ?? "",
    Gender: student.gender ?? "",
    Status: student.status ?? "",
    Phone: student.phone ?? "",
    Email: student.email ?? "",
    Guardian: student.guardian ?? "",
  }));
}

export function exportStudentsToExcel(students, filename = "students.xlsx") {
  const rows = toExportRows(students);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, filename);
}

export function exportStudentsToPdf(students, filename = "students.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  const rows = toExportRows(students);

  doc.setFontSize(14);
  doc.text("DIS-SMS Students Directory", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Exported ${new Date().toLocaleString()} · ${rows.length} record(s)`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Name",
        "Admission No",
        "Class",
        "Gender",
        "Status",
        "Phone",
        "Email",
        "Guardian",
      ],
    ],
    body: rows.map((row) => [
      row.Name,
      row["Admission No"],
      row.Class,
      row.Gender,
      row.Status,
      row.Phone,
      row.Email,
      row.Guardian,
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
