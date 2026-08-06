import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "attendanceDateLabel", label: "Date" },
  { key: "studentName", label: "Student" },
  { key: "admissionNo", label: "Admission No" },
  { key: "classLabel", label: "Class" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

const ROSTER_EXPORT_COLUMNS = [
  { key: "admissionNo", label: "Admission No" },
  { key: "studentName", label: "Student" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
  { key: "attendanceDateLabel", label: "Date" },
  { key: "classLabel", label: "Class" },
];

export function exportAttendanceToExcel(
  rows,
  filename = "attendance.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Attendance",
    columns: EXPORT_COLUMNS,
  });
}

export function exportAttendanceToPdf(
  rows,
  filename = "attendance.pdf"
) {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Attendance",
    columns: EXPORT_COLUMNS,
  });
}

export function printAttendance(rows) {
  printData(rows, {
    title: "DIS-SMS Attendance",
    columns: EXPORT_COLUMNS,
  });
}

export function exportRosterToExcel(
  rows,
  filename = "attendance-roster.xlsx"
) {
  exportToExcel(rows, {
    filename,
    sheetName: "Roster",
    columns: ROSTER_EXPORT_COLUMNS,
  });
}

export function exportRosterToPdf(rows, filename = "attendance-roster.pdf") {
  exportToPdf(rows, {
    filename,
    title: "DIS-SMS Attendance Roster",
    columns: ROSTER_EXPORT_COLUMNS,
  });
}

export function printRoster(rows) {
  printData(rows, {
    title: "DIS-SMS Attendance Roster",
    columns: ROSTER_EXPORT_COLUMNS,
  });
}
