import {
  exportToCsv,
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "admissionNo", label: "Admission No" },
  { key: "studentName", label: "Student" },
  { key: "fromClassLabel", label: "From Class" },
  { key: "toClassLabel", label: "To Class" },
  { key: "academicYearName", label: "From Year" },
  { key: "toAcademicYearName", label: "To Year" },
  { key: "termName", label: "Term" },
  { key: "averageScoreLabel", label: "Average" },
  { key: "overallGrade", label: "Grade" },
  { key: "decisionLabel", label: "Decision" },
  { key: "workflowLabel", label: "Workflow" },
  { key: "enrollmentNumber", label: "New Enrollment" },
  { key: "status", label: "Status" },
];

export function exportPromotionsToExcel(rows, filename = "student-promotions.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Promotions",
    columns: EXPORT_COLUMNS,
  });
}

export function exportPromotionsToCsv(rows, filename = "student-promotions.csv") {
  exportToCsv(rows, { filename, columns: EXPORT_COLUMNS });
}

export function exportPromotionsToPdf(rows, filename = "student-promotions.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Student Promotions",
    columns: EXPORT_COLUMNS,
  });
}

export function printPromotions(rows) {
  printData(rows, {
    title: "DIS-SMS Student Promotions",
    columns: EXPORT_COLUMNS,
  });
}
