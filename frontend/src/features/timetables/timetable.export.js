import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "dayLabel", label: "Day" },
  { key: "timeRange", label: "Time" },
  { key: "classLabel", label: "Class" },
  { key: "subjectLabel", label: "Subject" },
  { key: "teacherName", label: "Teacher" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "termName", label: "Term" },
  { key: "room", label: "Room" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export function exportTimetablesToExcel(
  entries,
  filename = "timetables.xlsx"
) {
  exportToExcel(entries, {
    filename,
    sheetName: "Timetable",
    columns: EXPORT_COLUMNS,
  });
}

export function exportTimetablesToPdf(
  entries,
  filename = "timetables.pdf"
) {
  exportToPdf(entries, {
    filename,
    title: "DIS-SMS Timetable",
    columns: EXPORT_COLUMNS,
  });
}

export function printTimetables(entries) {
  printData(entries, {
    title: "DIS-SMS Timetable",
    columns: EXPORT_COLUMNS,
  });
}
