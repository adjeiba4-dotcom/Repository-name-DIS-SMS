import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "assessmentTypeLabel", label: "Type" },
  { key: "assessmentDateLabel", label: "Date" },
  { key: "classLabel", label: "Class" },
  { key: "subjectLabel", label: "Subject" },
  { key: "teacherName", label: "Teacher" },
  { key: "maxMarks", label: "Max Marks" },
  { key: "scoreCount", label: "Scores" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

const SCORE_EXPORT_COLUMNS = [
  { key: "admissionNo", label: "Admission No" },
  { key: "studentName", label: "Student" },
  { key: "marks", label: "Marks" },
  { key: "percentage", label: "Percentage" },
  { key: "remarks", label: "Remarks" },
];

export function exportAssessmentsToExcel(
  rows,
  filename = "assessments.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Assessments",
    columns: EXPORT_COLUMNS,
  });
}

export function exportAssessmentsToPdf(
  rows,
  filename = "assessments.pdf"
) {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Assessments",
    columns: EXPORT_COLUMNS,
  });
}

export function printAssessments(rows) {
  printData(rows, {
    title: "DIS-SMS Assessments",
    columns: EXPORT_COLUMNS,
  });
}

export function exportScoresToExcel(rows, filename = "assessment-scores.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}

export function exportScoresToPdf(rows, filename = "assessment-scores.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Assessment Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}

export function printScores(rows) {
  printData(rows, {
    title: "DIS-SMS Assessment Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}
