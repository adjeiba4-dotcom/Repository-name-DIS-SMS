import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "guardianNumber", label: "Guardian Number" },
  { key: "name", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

export function exportGuardiansToExcel(
  guardians,
  filename = "guardians.xlsx"
) {
  exportToExcel(guardians, {
    filename,
    sheetName: "Guardians",
    columns: EXPORT_COLUMNS,
  });
}

export function exportGuardiansToPdf(
  guardians,
  filename = "guardians.pdf"
) {
  exportToPdf(guardians, {
    filename,
    title: "DIS-SMS Guardians Directory",
    columns: EXPORT_COLUMNS,
  });
}

export function printGuardians(guardians) {
  printData(guardians, {
    title: "DIS-SMS Guardians Directory",
    columns: EXPORT_COLUMNS,
  });
}
