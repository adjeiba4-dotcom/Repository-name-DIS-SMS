import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "startDateLabel", label: "Start Date" },
  { key: "endDateLabel", label: "End Date" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
];

export function exportTermsToExcel(terms, filename = "terms.xlsx") {
  exportToExcel(terms, {
    filename,
    sheetName: "Terms",
    columns: EXPORT_COLUMNS,
  });
}

export function exportTermsToPdf(terms, filename = "terms.pdf") {
  exportToPdf(terms, {
    filename,
    title: "DIS-SMS Terms",
    columns: EXPORT_COLUMNS,
  });
}

export function printTerms(terms) {
  printData(terms, {
    title: "DIS-SMS Terms",
    columns: EXPORT_COLUMNS,
  });
}
