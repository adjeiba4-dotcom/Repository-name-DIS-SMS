import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "examinationTypeLabel", label: "Type" },
  { key: "examinationDateLabel", label: "Date" },
  { key: "classLabel", label: "Class" },
  { key: "subjectLabel", label: "Subject" },
  { key: "teacherName", label: "Teacher" },
  { key: "maxMarks", label: "Max Marks" },
  { key: "passingMarks", label: "Pass Marks" },
  { key: "durationLabel", label: "Duration" },
  { key: "isLockedLabel", label: "Locked" },
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
  { key: "passFail", label: "Result" },
  { key: "percentage", label: "Percentage" },
  { key: "remarks", label: "Remarks" },
];

export function exportExaminationsToExcel(
  rows,
  filename = "examinations.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Examinations",
    columns: EXPORT_COLUMNS,
  });
}

export function exportExaminationsToPdf(
  rows,
  filename = "examinations.pdf"
) {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Examinations",
    columns: EXPORT_COLUMNS,
  });
}

export function printExaminations(rows) {
  printData(rows, {
    title: "DIS-SMS Examinations",
    columns: EXPORT_COLUMNS,
  });
}

export function exportScoresToExcel(rows, filename = "examination-scores.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}

export function exportScoresToPdf(rows, filename = "examination-scores.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Examination Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}

export function printScores(rows) {
  printData(rows, {
    title: "DIS-SMS Examination Scores",
    columns: SCORE_EXPORT_COLUMNS,
  });
}
