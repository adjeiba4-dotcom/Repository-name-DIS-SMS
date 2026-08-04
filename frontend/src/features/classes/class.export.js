import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "classCode", label: "Code" },
  { key: "className", label: "Name" },
  { key: "academicYearName", label: "Academic Year" },
  { key: "departmentName", label: "Department" },
  { key: "classTeacherName", label: "Class Teacher" },
  { key: "capacity", label: "Capacity" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
];

export function exportClassesToExcel(classes, filename = "classes.xlsx") {
  exportToExcel(classes, {
    filename,
    sheetName: "Classes",
    columns: EXPORT_COLUMNS,
  });
}

export function exportClassesToPdf(classes, filename = "classes.pdf") {
  exportToPdf(classes, {
    filename,
    title: "DIS-SMS Classes",
    columns: EXPORT_COLUMNS,
  });
}

export function printClasses(classes) {
  printData(classes, {
    title: "DIS-SMS Classes",
    columns: EXPORT_COLUMNS,
  });
}
