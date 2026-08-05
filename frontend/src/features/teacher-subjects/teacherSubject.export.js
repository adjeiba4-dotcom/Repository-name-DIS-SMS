import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "teacherName", label: "Teacher" },
  { key: "subjectName", label: "Subject" },
  { key: "subjectCode", label: "Subject Code" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "isPrimaryLabel", label: "Primary" },
  { key: "weeklyPeriods", label: "Weekly Periods" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export function exportTeacherSubjectsToExcel(
  assignments,
  filename = "teacher-subjects.xlsx"
) {
  exportToExcel(assignments, {
    filename,
    sheetName: "Teacher Subjects",
    columns: EXPORT_COLUMNS,
  });
}

export function exportTeacherSubjectsToPdf(
  assignments,
  filename = "teacher-subjects.pdf"
) {
  exportToPdf(assignments, {
    filename,
    title: "DIS-SMS Teacher Subject Assignments",
    columns: EXPORT_COLUMNS,
  });
}

export function printTeacherSubjects(assignments) {
  printData(assignments, {
    title: "DIS-SMS Teacher Subject Assignments",
    columns: EXPORT_COLUMNS,
  });
}
