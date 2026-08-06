import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Hash,
  School,
  User,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import {
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
} from "../../components/profile";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { getStudentResultProfile } from "../../services/results/result.service";
import {
  exportStudentProfileToCsv,
  exportStudentProfileToExcel,
  exportStudentProfileToPdf,
  printStudentProfile,
} from "./result.export";
import {
  formatClassLabel,
  formatScore,
  formatStudentName,
  formatSubjectLabel,
  formatWorkflowStatus,
  getApiErrorMessage,
  mapResultToRow,
} from "./result.mappers";

const SUBJECT_COLUMNS = [
  {
    key: "subjectLabel",
    label: "Subject",
    sortable: true,
  },
  { key: "caScoreLabel", label: "CA", sortable: true },
  { key: "examScoreLabel", label: "Exam", sortable: true },
  { key: "finalScoreLabel", label: "Final", sortable: true },
  { key: "gradeLetter", label: "Grade", sortable: true },
  {
    key: "passFailLabel",
    label: "Outcome",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "inline-flex rounded-full px-[var(--space-2)] py-0.5 text-[length:var(--font-size-xs)] font-[number:var(--font-weight-semibold)]",
          row.isPassed
            ? "bg-[var(--color-success-100)] text-[var(--color-success-700)]"
            : "bg-[var(--color-danger-100)] text-[var(--color-danger-700)]"
        )}
      >
        {row.passFailLabel}
      </span>
    ),
  },
  { key: "subjectPosition", label: "Subj #", sortable: true },
  { key: "workflowLabel", label: "Workflow", sortable: true },
  { key: "remarks", label: "Remark", className: "hidden xl:table-cell" },
];

/**
 * Multi-subject student result profile (report-card style drawer).
 */
export default function StudentResultProfile({
  open,
  studentId,
  filters = {},
  onClose,
  onViewSubject,
}) {
  const profileQuery = useQuery({
    queryKey: [
      "results",
      "student-profile",
      studentId,
      filters.academicYearId,
      filters.termId,
      filters.classId,
    ],
    queryFn: async () => {
      const response = await getStudentResultProfile(studentId, {
        academicYearId: filters.academicYearId || undefined,
        termId: filters.termId || undefined,
        classId: filters.classId || undefined,
      });
      return response?.data ?? null;
    },
    enabled: Boolean(open && studentId),
  });

  const profile = profileQuery.data ?? null;
  const loading = profileQuery.isLoading || profileQuery.isFetching;
  const error = profileQuery.isError
    ? getApiErrorMessage(
        profileQuery.error,
        "Unable to load student result profile."
      )
    : "";

  const student = profile?.student || {};
  const summary = profile?.summary || {};
  const rows = (profile?.subjects || []).map(mapResultToRow);
  const studentName = formatStudentName(student);

  const handleExport = (action) => {
    if (!rows.length) return;
    action();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Student Result Profile"
      description="Multi-subject composite results for the selected academic scope."
      size="xl"
      footer={
        <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={() =>
              handleExport(() =>
                exportStudentProfileToExcel(
                  rows,
                  `student-results-${student.admissionNo || studentId}.xlsx`
                )
              )
            }
            onExportCsv={() =>
              handleExport(() =>
                exportStudentProfileToCsv(
                  rows,
                  `student-results-${student.admissionNo || studentId}.csv`
                )
              )
            }
            onExportPdf={() =>
              handleExport(() =>
                exportStudentProfileToPdf(
                  rows,
                  `student-results-${student.admissionNo || studentId}.pdf`
                )
              )
            }
            onPrint={() => handleExport(() => printStudentProfile(rows))}
            disabled={!rows.length}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <Alert variant="error" title="Profile unavailable">
          {error}
        </Alert>
      ) : !profile ? (
        <Caption variant="muted">No student profile data.</Caption>
      ) : (
        <div className="space-y-[var(--space-6)]">
          <ProfileHeader
            name={studentName}
            subtitle={`${student.admissionNo || "—"} · ${formatClassLabel(
              student.schoolClass || rows[0]?.raw?.schoolClass || {}
            )}`}
            status={summary.passedCount >= summary.failedCount ? "Pass" : "Review"}
            statusLabel={
              summary.subjectCount
                ? `${summary.passedCount}/${summary.subjectCount} passed`
                : "No subjects"
            }
          />

          <ProfileSection title="Overall summary">
            <ProfileDetailItem
              icon={User}
              label="Student"
              value={studentName}
            />
            <ProfileDetailItem
              icon={Hash}
              label="Admission No"
              value={student.admissionNo || "—"}
            />
            <ProfileDetailItem
              icon={Award}
              label="Average"
              value={formatScore(summary.average)}
            />
            <ProfileDetailItem
              icon={School}
              label="Class position"
              value={summary.classPosition ?? "—"}
            />
            <ProfileDetailItem
              icon={Award}
              label="Class average"
              value={formatScore(summary.classAverage)}
            />
            <ProfileDetailItem
              icon={Hash}
              label="Subjects"
              value={String(summary.subjectCount ?? 0)}
            />
          </ProfileSection>

          <div>
            <Body
              size="sm"
              className="m-0 mb-[var(--space-3)] font-[number:var(--font-weight-semibold)]"
            >
              Subject results
            </Body>
            <DataTable
              columns={SUBJECT_COLUMNS}
              rows={rows}
              emptyTitle="No subject results"
              emptyDescription="Generate results for this student to populate the profile."
              getRowActions={
                onViewSubject
                  ? (row) => [
                      {
                        key: "view",
                        label: "Open subject result",
                        onClick: () => onViewSubject(row),
                      },
                    ]
                  : undefined
              }
            />
            {!rows.length ? null : (
              <Caption variant="muted" className="mt-[var(--space-2)] m-0">
                Workflow across subjects:{" "}
                {summary.workflow?.verified ?? 0} verified ·{" "}
                {summary.workflow?.published ?? 0} published ·{" "}
                {summary.workflow?.locked ?? 0} locked. Latest subject workflow:{" "}
                {formatWorkflowStatus(rows[0]?.workflowStatus, rows[0])} ·{" "}
                {formatSubjectLabel(rows[0]?.raw?.subject || {})}
              </Caption>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
