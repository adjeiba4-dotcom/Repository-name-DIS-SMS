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
  { key: "subjectLabel", label: "Subject" },
  { key: "caScoreLabel", label: "CA Score" },
  { key: "examScoreLabel", label: "Exam Score" },
  { key: "weightsLabel", label: "CA/Exam Weight" },
  { key: "finalScoreLabel", label: "Final Score" },
  { key: "gradeLetter", label: "Grade" },
  { key: "passFailLabel", label: "Pass/Fail" },
  { key: "subjectPosition", label: "Subject Pos." },
  { key: "classPosition", label: "Class Pos." },
  { key: "workflowLabel", label: "Workflow" },
  { key: "publishedLabel", label: "Published" },
  { key: "lockedLabel", label: "Locked" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "remarks", label: "Remark" },
  { key: "status", label: "Status" },
];

export function exportResultsToExcel(rows, filename = "results.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Results",
    columns: EXPORT_COLUMNS,
  });
}

export function exportResultsToCsv(rows, filename = "results.csv") {
  exportToCsv(rows, {
    filename,
    columns: EXPORT_COLUMNS,
  });
}

export function exportResultsToPdf(rows, filename = "results.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Results",
    columns: EXPORT_COLUMNS,
  });
}

export function printResults(rows) {
  printData(rows, {
    title: "DIS-SMS Results",
    columns: EXPORT_COLUMNS,
  });
}

export function exportBroadsheetToExcel(rows, filename = "broadsheet.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Broadsheet",
  });
}

export function exportBroadsheetToCsv(rows, filename = "broadsheet.csv") {
  exportToCsv(rows, { filename });
}

export function exportBroadsheetToPdf(rows, filename = "broadsheet.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Class Broadsheet",
  });
}

export function printBroadsheet(rows) {
  printData(rows, { title: "DIS-SMS Class Broadsheet" });
}

export function exportMeritListToExcel(rows, filename = "merit-list.xlsx") {
  exportToExcel(rows, {
    filename,
    sheetName: "Merit List",
    columns: [
      { key: "meritPosition", label: "Position" },
      { key: "admissionNo", label: "Admission No" },
      { key: "studentName", label: "Student" },
      { key: "average", label: "Average" },
      { key: "subjectCount", label: "Subjects" },
      { key: "passedCount", label: "Passed" },
      { key: "failedCount", label: "Failed" },
      { key: "classPosition", label: "Class Pos." },
    ],
  });
}

export function exportMeritListToCsv(rows, filename = "merit-list.csv") {
  exportToCsv(rows, {
    filename,
    columns: [
      { key: "meritPosition", label: "Position" },
      { key: "admissionNo", label: "Admission No" },
      { key: "studentName", label: "Student" },
      { key: "average", label: "Average" },
      { key: "subjectCount", label: "Subjects" },
      { key: "passedCount", label: "Passed" },
      { key: "failedCount", label: "Failed" },
      { key: "classPosition", label: "Class Pos." },
    ],
  });
}

export function exportMeritListToPdf(rows, filename = "merit-list.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Merit List",
    columns: [
      { key: "meritPosition", label: "Position" },
      { key: "admissionNo", label: "Admission No" },
      { key: "studentName", label: "Student" },
      { key: "average", label: "Average" },
      { key: "subjectCount", label: "Subjects" },
      { key: "passedCount", label: "Passed" },
      { key: "failedCount", label: "Failed" },
      { key: "classPosition", label: "Class Pos." },
    ],
  });
}

export function printMeritList(rows) {
  printData(rows, {
    title: "DIS-SMS Merit List",
    columns: [
      { key: "meritPosition", label: "Position" },
      { key: "admissionNo", label: "Admission No" },
      { key: "studentName", label: "Student" },
      { key: "average", label: "Average" },
      { key: "subjectCount", label: "Subjects" },
      { key: "passedCount", label: "Passed" },
      { key: "failedCount", label: "Failed" },
      { key: "classPosition", label: "Class Pos." },
    ],
  });
}

const STUDENT_PROFILE_COLUMNS = [
  { key: "subjectLabel", label: "Subject" },
  { key: "caScoreLabel", label: "CA" },
  { key: "examScoreLabel", label: "Exam" },
  { key: "finalScoreLabel", label: "Final" },
  { key: "gradeLetter", label: "Grade" },
  { key: "passFailLabel", label: "Outcome" },
  { key: "subjectPosition", label: "Subject Pos." },
  { key: "classPosition", label: "Class Pos." },
  { key: "workflowLabel", label: "Workflow" },
  { key: "remarks", label: "Remark" },
];

export function exportStudentProfileToExcel(
  rows,
  filename = "student-results.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Student Results",
    columns: STUDENT_PROFILE_COLUMNS,
  });
}

export function exportStudentProfileToCsv(
  rows,
  filename = "student-results.csv"
) {
  exportToCsv(rows, {
    filename,
    columns: STUDENT_PROFILE_COLUMNS,
  });
}

export function exportStudentProfileToPdf(
  rows,
  filename = "student-results.pdf"
) {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Student Result Profile",
    columns: STUDENT_PROFILE_COLUMNS,
  });
}

export function printStudentProfile(rows) {
  printData(rows, {
    title: "DIS-SMS Student Result Profile",
    columns: STUDENT_PROFILE_COLUMNS,
  });
}
