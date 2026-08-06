import {
  Archive,
  BarChart3,
  Eye,
  Lock,
  LockOpen,
  Megaphone,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  PASS_FILTER_OPTIONS,
  WORKFLOW_FILTER_OPTIONS,
} from "./result.mappers";

const COLUMNS = [
  {
    key: "studentName",
    label: "Student",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.studentName}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.admissionNo}
        </Caption>
      </div>
    ),
  },
  {
    key: "classLabel",
    label: "Class",
    sortable: true,
    className: "hidden md:table-cell",
  },
  {
    key: "subjectLabel",
    label: "Subject",
    sortable: true,
  },
  {
    key: "caScoreLabel",
    label: "CA",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "examScoreLabel",
    label: "Exam",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "finalScoreLabel",
    label: "Final",
    sortable: true,
    render: (row) => (
      <span className="font-[number:var(--font-weight-semibold)]">
        {row.finalScoreLabel}
      </span>
    ),
  },
  {
    key: "gradeLetter",
    label: "Grade",
    sortable: true,
  },
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
  {
    key: "subjectPosition",
    label: "Subj #",
    sortable: true,
    className: "hidden xl:table-cell",
  },
  {
    key: "classPosition",
    label: "Class #",
    sortable: true,
    className: "hidden xl:table-cell",
  },
  {
    key: "workflowLabel",
    label: "Workflow",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => (
      <StatusBadge status={row.workflowLabel} label={row.workflowLabel} />
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    className: "hidden xl:table-cell",
    render: (row) => (
      <StatusBadge status={row.status} label={row.status} />
    ),
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
  },
];

export default function ResultList({
  title = "Results Directory",
  description = "Composite CA + examination results for the selected scope.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  passFilter = "all",
  workflowFilter = "all",
  sortKey = "finalScoreLabel",
  sortDirection = "desc",
  archivedView = false,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onPassFilterChange,
  onWorkflowFilterChange,
  onSortChange,
  onView,
  onViewStudent,
  onArchive,
  onRestore,
  onToggleVerify,
  onTogglePublish,
  onToggleLock,
  onGenerate,
  canGenerate = true,
  canVerify = true,
  canPublish = true,
  canLock = true,
  canArchive = true,
  onExportExcel,
  onExportCsv,
  onExportPdf,
  onPrint,
  emptyActionLabel,
  onEmptyAction,
  className = "",
}) {
  const filters = [
    onPassFilterChange && !archivedView
      ? {
          id: "result-pass-filter",
          label: "Outcome",
          value: passFilter,
          onChange: onPassFilterChange,
          options: PASS_FILTER_OPTIONS,
        }
      : null,
    onWorkflowFilterChange && !archivedView
      ? {
          id: "result-workflow-filter",
          label: "Workflow",
          value: workflowFilter,
          onChange: onWorkflowFilterChange,
          options: WORKFLOW_FILTER_OPTIONS,
        }
      : null,
  ].filter(Boolean);

  return (
    <DataTable
      className={cn(className)}
      title={title}
      description={description}
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      emptyIcon={BarChart3}
      emptyTitle={archivedView ? "No archived results" : "No results found"}
      emptyDescription={
        archivedView
          ? "Archived results will appear here."
          : "Generate composite results from locked examinations and continuous assessments."
      }
      emptyActionLabel={emptyActionLabel}
      onEmptyAction={onEmptyAction}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={onSortChange}
      searchable
      search={search}
      searchLabel="Search results"
      searchPlaceholder="Search student, subject, class, or grade…"
      onSearchChange={onSearchChange}
      filters={filters}
      toolbarActions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportCsv={onExportCsv}
            onExportPdf={onExportPdf}
            onPrint={onPrint}
            disabled={rows.length === 0}
          />
          {onGenerate && !archivedView && canGenerate ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={onGenerate}
              disabled={loading}
            >
              Generate Results
            </Button>
          ) : null}
        </div>
      }
      getRowActions={(row) => {
        if (archivedView) {
          return [
            {
              key: "restore",
              label: "Restore",
              icon: RotateCcw,
              tone: "success",
              onClick: () => onRestore?.(row),
            },
          ];
        }

        return [
          {
            key: "view",
            label: "View details",
            icon: Eye,
            tone: "brand",
            onClick: () => onView?.(row),
          },
          onViewStudent
            ? {
                key: "student-profile",
                label: "Student profile",
                icon: UserRound,
                tone: "info",
                onClick: () => onViewStudent?.(row),
              }
            : null,
          canVerify
            ? {
                key: "verify",
                label: row.isVerified ? "Verified" : "Verify",
                icon: ShieldCheck,
                tone: "success",
                disabled: row.isVerified || row.isLocked,
                onClick: () => onToggleVerify?.(row),
              }
            : null,
          canPublish
            ? {
                key: "publish",
                label: row.isPublished ? "Unpublish" : "Publish",
                icon: Megaphone,
                tone: "info",
                onClick: () => onTogglePublish?.(row),
              }
            : null,
          canLock
            ? {
                key: "lock",
                label: row.isLocked ? "Unlock" : "Lock",
                icon: row.isLocked ? LockOpen : Lock,
                tone: "warning",
                onClick: () => onToggleLock?.(row),
              }
            : null,
          canArchive
            ? {
                key: "archive",
                label: "Archive",
                icon: Archive,
                tone: "danger",
                onClick: () => onArchive?.(row),
              }
            : null,
        ].filter(Boolean);
      }}
    />
  );
}
