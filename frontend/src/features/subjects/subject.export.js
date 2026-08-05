import {
  exportToExcel,
  exportToPdf,
  printData,
} from "../../components/export";

const EXPORT_COLUMNS = [
  { key: "subjectCode", label: "Code" },
  { key: "subjectName", label: "Name" },
  { key: "shortName", label: "Short Name" },
  { key: "category", label: "Category" },
  { key: "creditHours", label: "Credit Hours" },
  { key: "departmentName", label: "Department" },
  { key: "schoolClassName", label: "Class" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
];

export function exportSubjectsToExcel(subjects, filename = "subjects.xlsx") {
  exportToExcel(subjects, {
    filename,
    sheetName: "Subjects",
    columns: EXPORT_COLUMNS,
  });
}

export function exportSubjectsToPdf(subjects, filename = "subjects.pdf") {
  exportToPdf(subjects, {
    filename,
    title: "DIS-SMS Subjects",
    columns: EXPORT_COLUMNS,
  });
}

export function printSubjects(subjects) {
  printData(subjects, {
    title: "DIS-SMS Subjects",
    columns: EXPORT_COLUMNS,
  });
}
