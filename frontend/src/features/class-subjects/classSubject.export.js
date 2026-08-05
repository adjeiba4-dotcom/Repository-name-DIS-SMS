import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "className", label: "Class" },
  { key: "classCode", label: "Class Code" },
  { key: "subjectName", label: "Subject" },
  { key: "subjectCode", label: "Subject Code" },
  { key: "teacherName", label: "Teacher" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "isCompulsoryLabel", label: "Compulsory" },
  { key: "weeklyPeriods", label: "Weekly Periods" },
  { key: "displayOrder", label: "Display Order" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export function exportClassSubjectsToExcel(
  allocations,
  filename = "class-subjects.xlsx"
) {
  exportToExcel(allocations, {
    filename,
    sheetName: "Class Subjects",
    columns: EXPORT_COLUMNS,
  });
}

export function exportClassSubjectsToPdf(
  allocations,
  filename = "class-subjects.pdf"
) {
  exportToPdf(allocations, {
    filename,
    title: "DIS-SMS Class Subject Allocations",
    columns: EXPORT_COLUMNS,
  });
}

export function printClassSubjects(allocations) {
  printData(allocations, {
    title: "DIS-SMS Class Subject Allocations",
    columns: EXPORT_COLUMNS,
  });
}
