import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "teacherCount", label: "Teachers" },
  { key: "subjectCount", label: "Subjects" },
  { key: "employeeCount", label: "Employees" },
];

export function exportDepartmentsToExcel(
  departments,
  filename = "departments.xlsx"
) {
  exportToExcel(departments, {
    filename,
    sheetName: "Departments",
    columns: EXPORT_COLUMNS,
  });
}

export function exportDepartmentsToPdf(
  departments,
  filename = "departments.pdf"
) {
  exportToPdf(departments, {
    filename,
    title: "DIS-SMS Departments",
    columns: EXPORT_COLUMNS,
  });
}

export function printDepartments(departments) {
  printData(departments, {
    title: "DIS-SMS Departments",
    columns: EXPORT_COLUMNS,
  });
}
