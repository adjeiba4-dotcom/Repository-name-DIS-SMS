import { Trophy } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { EmptyState, Panel } from "../../components/dashboard";
import { ExportButtons } from "../../components/export";
import { DataTableSkeleton } from "../../components/ui/Skeleton";
import { formatScore } from "./result.mappers";
import {
  exportMeritListToCsv,
  exportMeritListToExcel,
  exportMeritListToPdf,
  printMeritList,
} from "./result.export";

const COLUMNS = [
  { key: "meritPosition", label: "Pos.", sortable: true },
  { key: "studentName", label: "Student", sortable: true },
  { key: "admissionNo", label: "Admission No", sortable: true },
  { key: "average", label: "Average", sortable: true },
  { key: "subjectCount", label: "Subjects", sortable: true },
  { key: "passedCount", label: "Passed", sortable: true },
  { key: "failedCount", label: "Failed", sortable: true },
  { key: "classPosition", label: "Class #", sortable: true },
];

export default function ResultMeritList({
  meritList = null,
  loading = false,
  onExportError,
  onViewStudent,
}) {
  if (loading) {
    return <DataTableSkeleton rows={8} />;
  }

  if (!meritList) {
    return (
      <EmptyState
        icon={Trophy}
        title="Select a class for the merit list"
        description="Choose academic year, term, and class to rank students by average final score."
      />
    );
  }

  const rows = (meritList.ranks || []).map((item) => ({
    ...item,
    average: formatScore(item.average),
    classPosition: item.classPosition ?? "—",
  }));

  const handleExport = (action) => {
    if (!rows.length) {
      onExportError?.("No merit list rows to export.");
      return;
    }
    action();
  };

  return (
    <Panel
      title="Merit List"
      description={`${meritList.schoolClass?.className || "Class"} · Top ${
        meritList.limit || rows.length
      } by average final score`}
      actions={
        <ExportButtons
          onExportExcel={() =>
            handleExport(() =>
              exportMeritListToExcel(meritList.ranks || [], "merit-list.xlsx")
            )
          }
          onExportCsv={() =>
            handleExport(() =>
              exportMeritListToCsv(meritList.ranks || [], "merit-list.csv")
            )
          }
          onExportPdf={() =>
            handleExport(() =>
              exportMeritListToPdf(meritList.ranks || [], "merit-list.pdf")
            )
          }
          onPrint={() =>
            handleExport(() => printMeritList(meritList.ranks || []))
          }
          disabled={!rows.length}
        />
      }
    >
      {!rows.length ? (
        <EmptyState
          icon={Trophy}
          title="No ranked students"
          description="Generate results for this class to build a merit list."
        />
      ) : (
        <DataTable
          title="Rankings"
          description="Ordered by average final score across subjects."
          columns={COLUMNS}
          rows={rows}
          loading={false}
          searchable={false}
          page={1}
          pageSize={rows.length || 10}
          total={rows.length}
          getRowActions={
            onViewStudent
              ? (row) => [
                  {
                    key: "student-profile",
                    label: "Student profile",
                    onClick: () =>
                      onViewStudent({
                        studentId: row.studentId,
                        studentName: row.studentName,
                      }),
                  },
                ]
              : undefined
          }
        />
      )}
    </Panel>
  );
}
