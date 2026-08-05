import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "enrollmentNumber", label: "Enrollment No" },
  { key: "admissionNo", label: "Student No" },
  { key: "studentName", label: "Student" },
  { key: "guardianName", label: "Guardian" },
  { key: "className", label: "Class" },
  { key: "classCode", label: "Class Code" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "enrollmentDateLabel", label: "Enrollment Date" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export function exportEnrollmentsToExcel(
  enrollments,
  filename = "enrollments.xlsx"
) {
  exportToExcel(enrollments, {
    filename,
    sheetName: "Enrollments",
    columns: EXPORT_COLUMNS,
  });
}

export function exportEnrollmentsToPdf(
  enrollments,
  filename = "enrollments.pdf"
) {
  exportToPdf(enrollments, {
    filename,
    title: "DIS-SMS Student Enrollments",
    columns: EXPORT_COLUMNS,
  });
}

export function printEnrollments(enrollments) {
  printData(enrollments, {
    title: "DIS-SMS Student Enrollments",
    columns: EXPORT_COLUMNS,
  });
}
