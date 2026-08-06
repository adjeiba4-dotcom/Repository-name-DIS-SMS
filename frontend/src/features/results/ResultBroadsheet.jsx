import { Table2 } from "lucide-react";

import { EmptyState, Panel } from "../../components/dashboard";
import { ExportButtons } from "../../components/export";
import { DataTableSkeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import { flattenBroadsheet, formatScore } from "./result.mappers";
import {
  exportBroadsheetToCsv,
  exportBroadsheetToExcel,
  exportBroadsheetToPdf,
  printBroadsheet,
} from "./result.export";

export default function ResultBroadsheet({
  broadsheet = null,
  loading = false,
  onExportError,
  onViewStudent,
}) {
  if (loading) {
    return <DataTableSkeleton rows={8} />;
  }

  if (!broadsheet) {
    return (
      <EmptyState
        icon={Table2}
        title="Select a class for the broadsheet"
        description="Choose academic year, term, and class to load the students × subjects matrix."
      />
    );
  }

  const subjects = broadsheet.subjects || [];
  const students = broadsheet.students || [];
  const exportRows = flattenBroadsheet(broadsheet);

  const handleExport = (action) => {
    if (!exportRows.length) {
      onExportError?.("No broadsheet rows to export.");
      return;
    }
    action();
  };

  return (
    <Panel
      title="Class Broadsheet"
      description={`${broadsheet.schoolClass?.className || "Class"} · ${
        broadsheet.term?.name || broadsheet.term?.code || "Term"
      } · ${broadsheet.academicYear?.name || "Year"}`}
      actions={
        <ExportButtons
          onExportExcel={() =>
            handleExport(() =>
              exportBroadsheetToExcel(exportRows, "class-broadsheet.xlsx")
            )
          }
          onExportCsv={() =>
            handleExport(() =>
              exportBroadsheetToCsv(exportRows, "class-broadsheet.csv")
            )
          }
          onExportPdf={() =>
            handleExport(() =>
              exportBroadsheetToPdf(exportRows, "class-broadsheet.pdf")
            )
          }
          onPrint={() => handleExport(() => printBroadsheet(exportRows))}
          disabled={!exportRows.length}
        />
      }
    >
      {!students.length ? (
        <EmptyState
          icon={Table2}
          title="No results for this class"
          description="Generate and verify results for subjects in this class to populate the broadsheet."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-[length:var(--font-size-sm)]">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <th className="px-[var(--space-3)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)]">
                  #
                </th>
                <th className="px-[var(--space-3)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)]">
                  Student
                </th>
                {subjects.map((subject) => (
                  <th
                    key={subject.id}
                    className="px-[var(--space-3)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)] whitespace-nowrap"
                    title={subject.subjectName}
                  >
                    {subject.subjectCode || subject.subjectName}
                  </th>
                ))}
                <th className="px-[var(--space-3)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)]">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.studentId}
                  className="border-b border-[var(--color-border-subtle)]"
                >
                  <td className="px-[var(--space-3)] py-[var(--space-2)]">
                    {student.classPosition ?? "—"}
                  </td>
                  <td className="px-[var(--space-3)] py-[var(--space-2)]">
                    {onViewStudent ? (
                      <button
                        type="button"
                        className="text-left font-[number:var(--font-weight-semibold)] text-[var(--color-ocean-blue)] hover:underline"
                        onClick={() =>
                          onViewStudent({
                            studentId: student.studentId,
                            studentName: student.studentName,
                          })
                        }
                      >
                        {student.studentName}
                      </button>
                    ) : (
                      <Body
                        size="sm"
                        className="m-0 font-[number:var(--font-weight-semibold)]"
                      >
                        {student.studentName}
                      </Body>
                    )}
                    <Caption variant="muted" size="sm" className="m-0">
                      {student.admissionNo || "—"}
                    </Caption>
                  </td>
                  {subjects.map((subject) => {
                    const cell = student.cells?.[subject.id];
                    return (
                      <td
                        key={`${student.studentId}-${subject.id}`}
                        className="px-[var(--space-3)] py-[var(--space-2)] whitespace-nowrap"
                      >
                        {cell
                          ? `${formatScore(cell.finalScore)}${
                              cell.grade ? ` (${cell.grade})` : ""
                            }`
                          : "—"}
                      </td>
                    );
                  })}
                  <td className="px-[var(--space-3)] py-[var(--space-2)] font-[number:var(--font-weight-semibold)]">
                    {formatScore(student.average)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
