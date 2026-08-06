import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  exportToCsv,
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "admissionNo", label: "Admission No" },
  { key: "studentName", label: "Student" },
  { key: "classLabel", label: "Class" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "averageScoreLabel", label: "Average" },
  { key: "overallGrade", label: "Grade" },
  { key: "classPosition", label: "Class Pos." },
  { key: "attendanceLabel", label: "Attendance" },
  { key: "promotionLabel", label: "Promotion" },
  { key: "workflowLabel", label: "Workflow" },
  { key: "publishedLabel", label: "Published" },
  { key: "lockedLabel", label: "Locked" },
  { key: "status", label: "Status" },
];

export function exportReportCardsToExcel(
  rows,
  filename = "report-cards.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Report Cards",
    columns: EXPORT_COLUMNS,
  });
}

export function exportReportCardsToCsv(rows, filename = "report-cards.csv") {
  exportToCsv(rows, { filename, columns: EXPORT_COLUMNS });
}

export function exportReportCardsToPdf(rows, filename = "report-cards.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Report Cards",
    columns: EXPORT_COLUMNS,
  });
}

export function printReportCards(rows) {
  printData(rows, {
    title: "DIS-SMS Report Cards",
    columns: EXPORT_COLUMNS,
  });
}

/**
 * Load an image URL as a data URL for jsPDF (best-effort; fails silently).
 */
async function loadImageDataUrl(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Professional A4 report card PDF from preview render model.
 */
export async function exportReportCardA4Pdf(
  preview,
  filename = "report-card.pdf"
) {
  if (!preview) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 12;

  const header = preview.header || {};
  const student = preview.student || {};
  const summary = preview.summary || {};
  const attendance = preview.attendance || {};
  const remarks = preview.remarks || {};
  const promotion = preview.promotion || {};
  const subjects = preview.subjects || [];
  const brandBlue = [14, 116, 144]; // Ocean Blue accent

  const logoData = await loadImageDataUrl(header.logoUrl);
  const photoData = await loadImageDataUrl(student.photoUrl);

  if (logoData) {
    try {
      doc.addImage(logoData, "JPEG", margin, y, 18, 18);
    } catch {
      /* ignore unsupported format */
    }
  }

  doc.setTextColor(...brandBlue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(header.schoolName || "School", pageWidth / 2, y + 6, {
    align: "center",
  });

  doc.setTextColor(60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (header.motto) {
    doc.text(header.motto, pageWidth / 2, y + 11, { align: "center" });
  }
  if (header.address) {
    doc.text(header.address, pageWidth / 2, y + 15, { align: "center" });
  }
  const contact = [header.phone, header.email].filter(Boolean).join(" · ");
  if (contact) {
    doc.text(contact, pageWidth / 2, y + 19, { align: "center" });
  }

  if (photoData) {
    try {
      doc.addImage(photoData, "JPEG", pageWidth - margin - 22, y, 22, 26);
    } catch {
      /* ignore */
    }
  } else {
    doc.setDrawColor(180);
    doc.rect(pageWidth - margin - 22, y, 22, 26);
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text("PHOTO", pageWidth - margin - 11, y + 14, { align: "center" });
  }

  y += 30;
  doc.setDrawColor(...brandBlue);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setTextColor(...brandBlue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(header.title || "STUDENT REPORT CARD", pageWidth / 2, y, {
    align: "center",
  });
  y += 6;
  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${header.academicYear || ""} · ${header.term || ""}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(40);
  const studentLines = [
    [`Student: ${student.fullName || "—"}`, `Admission No: ${student.admissionNo || "—"}`],
    [
      `Class: ${student.className || "—"}${student.classCode ? ` (${student.classCode})` : ""}`,
      `Gender: ${student.gender || "—"}`,
    ],
    [
      `Class Teacher: ${student.classTeacherName || "—"}`,
      `Date of Birth: ${student.dateOfBirth || "—"}`,
    ],
  ];
  studentLines.forEach((pair) => {
    doc.text(pair[0], margin, y);
    doc.text(pair[1], pageWidth / 2 + 2, y);
    y += 5;
  });
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Subject",
        "CA",
        "Exam",
        "Final",
        "Grade",
        "Pos.",
        "Remark",
      ],
    ],
    body: subjects.map((row) => [
      row.index,
      row.subjectName || row.subjectCode || "—",
      row.caScore ?? "—",
      row.examScore ?? "—",
      row.finalScore ?? "—",
      row.grade ?? "—",
      row.subjectPosition ?? "—",
      row.remarks || "",
    ]),
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: {
      fillColor: brandBlue,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 249, 255] },
  });

  y = (doc.lastAutoTable?.finalY || y) + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...brandBlue);
  doc.text("Academic Summary", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40);
  const summaryBits = [
    `Subjects: ${summary.subjectCount ?? "—"}`,
    `Average: ${summary.averageScore ?? "—"}`,
    `Overall Grade: ${summary.overallGrade ?? "—"}`,
    `Class Position: ${summary.classPosition ?? "—"}`,
    `Passed: ${summary.passedCount ?? 0}`,
    `Failed: ${summary.failedCount ?? 0}`,
  ];
  doc.text(summaryBits.join("   |   "), margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandBlue);
  doc.text("Attendance Summary", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  doc.text(
    [
      `Present: ${attendance.daysPresent ?? 0}`,
      `Absent: ${attendance.daysAbsent ?? 0}`,
      `Late: ${attendance.daysLate ?? 0}`,
      `Excused: ${attendance.daysExcused ?? 0}`,
      `Rate: ${attendance.attendancePercentage != null ? `${attendance.attendancePercentage}%` : "—"}`,
    ].join("   |   "),
    margin,
    y
  );
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandBlue);
  doc.text("Remarks", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  const teacherRemark = remarks.teacher || "—";
  const headRemark = remarks.headmaster || "—";
  const teacherLines = doc.splitTextToSize(
    `Class Teacher: ${teacherRemark}`,
    pageWidth - margin * 2
  );
  doc.text(teacherLines, margin, y);
  y += teacherLines.length * 4 + 2;
  const headLines = doc.splitTextToSize(
    `Headmaster: ${headRemark}`,
    pageWidth - margin * 2
  );
  doc.text(headLines, margin, y);
  y += headLines.length * 4 + 4;

  doc.setFont("helvetica", "bold");
  doc.text(`Promotion Decision: ${promotion.label || "Pending"}`, margin, y);
  y += 12;

  const sigWidth = (pageWidth - margin * 2) / 3;
  const signatures = preview.signatures || {};
  const blocks = [
    signatures.classTeacher,
    signatures.headmaster,
    signatures.parentGuardian,
  ];
  blocks.forEach((block, index) => {
    const x = margin + index * sigWidth;
    doc.setDrawColor(120);
    doc.line(x, y, x + sigWidth - 8, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60);
    doc.text(block?.label || "Signature", x, y + 4);
    if (block?.name) {
      doc.text(block.name, x, y + 8);
    }
  });

  y += 16;
  doc.setDrawColor(...brandBlue);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(120);
  const footer = preview.footer || {};
  doc.text(
    footer.confidentiality ||
      "This is an official academic report. Unauthorized alteration is prohibited.",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 4;
  doc.text(
    `${footer.brand || "DIS-SMS"} · Generated ${preview.meta?.printedAt || ""}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  doc.save(filename);
}

/**
 * Open a print-friendly A4 HTML window from the preview model.
 */
export function printReportCardA4(preview) {
  if (!preview || typeof window === "undefined") return;

  const header = preview.header || {};
  const student = preview.student || {};
  const summary = preview.summary || {};
  const attendance = preview.attendance || {};
  const remarks = preview.remarks || {};
  const promotion = preview.promotion || {};
  const subjects = preview.subjects || [];

  const subjectRows = subjects
    .map(
      (row) => `
      <tr>
        <td>${row.index}</td>
        <td>${row.subjectName || ""}</td>
        <td>${row.caScore ?? ""}</td>
        <td>${row.examScore ?? ""}</td>
        <td>${row.finalScore ?? ""}</td>
        <td>${row.grade ?? ""}</td>
        <td>${row.subjectPosition ?? ""}</td>
        <td>${row.remarks || ""}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Report Card — ${student.fullName || ""}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #0f172a; margin: 0; }
    .sheet { max-width: 210mm; margin: 0 auto; padding: 8mm; }
    .brand { color: #0e7490; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .header-center { text-align: center; flex: 1; }
    .logo, .photo { width: 72px; height: 72px; object-fit: cover; border: 1px solid #cbd5e1; }
    .photo { height: 88px; }
    h1 { margin: 0; font-size: 20px; color: #0e7490; }
    h2 { margin: 8px 0 4px; font-size: 15px; letter-spacing: 0.04em; color: #0e7490; text-align: center; }
    .muted { color: #64748b; font-size: 12px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #94a3b8; padding: 4px 6px; text-align: left; }
    th { background: #0e7490; color: #fff; }
    tr:nth-child(even) td { background: #f0f9ff; }
    .section { margin-top: 14px; }
    .section h3 { margin: 0 0 6px; font-size: 13px; color: #0e7490; }
    .sigs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 28px; }
    .sig { border-top: 1px solid #64748b; padding-top: 6px; font-size: 11px; }
    .footer { margin-top: 18px; border-top: 1px solid #0e7490; padding-top: 8px; text-align: center; font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>${header.logoUrl ? `<img class="logo" src="${header.logoUrl}" alt="Logo" />` : "<div class='logo'></div>"}</div>
      <div class="header-center">
        <h1>${header.schoolName || "School"}</h1>
        <div class="muted">${header.motto || ""}</div>
        <div class="muted">${header.address || ""}</div>
        <div class="muted">${[header.phone, header.email].filter(Boolean).join(" · ")}</div>
      </div>
      <div>${student.photoUrl ? `<img class="photo" src="${student.photoUrl}" alt="Student" />` : "<div class='photo'></div>"}</div>
    </div>
    <h2>${header.title || "STUDENT REPORT CARD"}</h2>
    <div class="muted" style="text-align:center">${header.academicYear || ""} · ${header.term || ""}</div>
    <div class="meta">
      <div><strong>Student:</strong> ${student.fullName || "—"}</div>
      <div><strong>Admission No:</strong> ${student.admissionNo || "—"}</div>
      <div><strong>Class:</strong> ${student.className || "—"}${student.classCode ? ` (${student.classCode})` : ""}</div>
      <div><strong>Gender:</strong> ${student.gender || "—"}</div>
      <div><strong>Class Teacher:</strong> ${student.classTeacherName || "—"}</div>
      <div><strong>Date of Birth:</strong> ${student.dateOfBirth || "—"}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Subject</th><th>CA</th><th>Exam</th><th>Final</th><th>Grade</th><th>Pos.</th><th>Remark</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>
    <div class="section">
      <h3>Academic Summary</h3>
      <div>Subjects: ${summary.subjectCount ?? "—"} · Average: ${summary.averageScore ?? "—"} · Overall Grade: ${summary.overallGrade ?? "—"} · Class Position: ${summary.classPosition ?? "—"} · Passed: ${summary.passedCount ?? 0} · Failed: ${summary.failedCount ?? 0}</div>
    </div>
    <div class="section">
      <h3>Attendance Summary</h3>
      <div>Present: ${attendance.daysPresent ?? 0} · Absent: ${attendance.daysAbsent ?? 0} · Late: ${attendance.daysLate ?? 0} · Excused: ${attendance.daysExcused ?? 0} · Rate: ${attendance.attendancePercentage != null ? `${attendance.attendancePercentage}%` : "—"}</div>
    </div>
    <div class="section">
      <h3>Remarks</h3>
      <div><strong>Class Teacher:</strong> ${remarks.teacher || "—"}</div>
      <div style="margin-top:6px"><strong>Headmaster:</strong> ${remarks.headmaster || "—"}</div>
      <div style="margin-top:8px"><strong>Promotion Decision:</strong> ${promotion.label || "Pending"}</div>
    </div>
    <div class="sigs">
      <div class="sig">Class Teacher<br/>${preview.signatures?.classTeacher?.name || ""}</div>
      <div class="sig">Headmaster / Principal<br/>${preview.signatures?.headmaster?.name || ""}</div>
      <div class="sig">Parent / Guardian<br/></div>
    </div>
    <div class="footer">
      ${(preview.footer && preview.footer.confidentiality) || "This is an official academic report."}<br/>
      ${(preview.footer && preview.footer.brand) || "DIS-SMS"}
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
