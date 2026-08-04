import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "startDateLabel", label: "Start Date" },
  { key: "endDateLabel", label: "End Date" },
  { key: "status", label: "Status" },
  { key: "termCount", label: "Terms" },
];

export function exportAcademicYearsToExcel(
  years,
  filename = "academic-years.xlsx"
) {
  exportToExcel(years, {
    filename,
    sheetName: "Academic Years",
    columns: EXPORT_COLUMNS,
  });
}

export function exportAcademicYearsToPdf(
  years,
  filename = "academic-years.pdf"
) {
  exportToPdf(years, {
    filename,
    title: "DIS-SMS Academic Years",
    columns: EXPORT_COLUMNS,
  });
}

export function printAcademicYears(years) {
  printData(years, {
    title: "DIS-SMS Academic Years",
    columns: EXPORT_COLUMNS,
  });
}
