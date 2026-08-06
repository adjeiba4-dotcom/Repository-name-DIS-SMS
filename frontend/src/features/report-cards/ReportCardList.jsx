import {
  Archive,
  Eye,
  FileDown,
  FileText,
  Lock,
  LockOpen,
  Megaphone,
  Pencil,
  Printer,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { WORKFLOW_FILTER_OPTIONS } from "./reportCard.mappers";

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
    key: "termName",
    label: "Term",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "averageScoreLabel",
    label: "Average",
    sortable: true,
    render: (row) => (
      <span className="font-[number:var(--font-weight-semibold)]">
        {row.averageScoreLabel}
      </span>
    ),
  },
  {
    key: "overallGrade",
    label: "Grade",
    sortable: true,
  },
  {
    key: "classPosition",
    label: "Pos.",
    sortable: true,
    className: "hidden xl:table-cell",
  },
  {
    key: "attendanceLabel",
    label: "Attend.",
    sortable: true,
    className: "hidden xl:table-cell",
  },
  {
    key: "promotionLabel",
    label: "Promotion",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "workflowLabel",
    label: "Workflow",
    sortable: true,
    render: (row) => (
      <StatusBadge
        status={row.workflowLabel}
        variant={
          row.isLocked
            ? "warning"
            : row.isPublished
              ? "success"
              : row.isVerified
                ? "info"
                : "secondary"
        }
      />
    ),
  },
];

export default function ReportCardList({
  title = "Report Cards",
  description = "Official academic snapshots generated from published results.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  workflowFilter = "all",
  sortKey = "averageScoreLabel",
  sortDirection = "desc",
  archivedView = false,
  canWrite = false,
  canVerify = false,
  canPublish = false,
  canLock = false,
  isAdmin = false,
  onSearchChange,
  onWorkflowFilterChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onPreview,
  onEdit,
  onVerify,
  onPublish,
  onLock,
  onArchive,
  onRestore,
  onDownloadPdf,
  onPrint,
  onExportExcel,
  onExportCsv,
  onExportPdf,
  onPrintList,
  onGenerate,
  onGenerateBulk,
  canGenerate = false,
  className = "",
}) {
  const filters = [
    onWorkflowFilterChange && !archivedView
      ? {
          id: "report-card-workflow-filter",
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
      emptyIcon={FileText}
      emptyTitle={archivedView ? "No archived report cards" : "No report cards found"}
      emptyDescription={
        archivedView
          ? "Archived report cards will appear here."
          : "Generate report cards from published results for a student or entire class."
      }
      emptyActionLabel={canGenerate && !archivedView ? "Generate Report Card" : undefined}
      onEmptyAction={canGenerate && !archivedView ? onGenerate : undefined}
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
      searchLabel="Search report cards"
      searchPlaceholder="Search student, admission no, or class…"
      onSearchChange={onSearchChange}
      filters={filters}
      toolbarActions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportCsv={onExportCsv}
            onExportPdf={onExportPdf}
            onPrint={onPrintList}
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
              Generate
            </Button>
          ) : null}
          {onGenerateBulk && !archivedView && canGenerate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-auto"
              onClick={onGenerateBulk}
              disabled={loading}
            >
              Bulk Class
            </Button>
          ) : null}
        </div>
      }
      getRowActions={(row) => {
        if (archivedView) {
          return canWrite
            ? [
                {
                  key: "restore",
                  label: "Restore",
                  icon: RotateCcw,
                  tone: "success",
                  onClick: () => onRestore?.(row),
                },
              ]
            : [];
        }

        const actions = [
          {
            key: "preview",
            label: "Preview",
            icon: Eye,
            tone: "brand",
            onClick: () => onPreview?.(row),
          },
          {
            key: "pdf",
            label: "Download PDF",
            icon: FileDown,
            onClick: () => onDownloadPdf?.(row),
          },
          {
            key: "print",
            label: "Print",
            icon: Printer,
            onClick: () => onPrint?.(row),
          },
        ];

        if (canWrite) {
          actions.push({
            key: "edit",
            label: "Edit remarks",
            icon: Pencil,
            disabled: row.isLocked && !isAdmin,
            onClick: () => onEdit?.(row),
          });
        }

        if (canVerify && !row.isPublished && !row.isLocked) {
          actions.push({
            key: "verify",
            label: row.isVerified ? "Unverify" : "Verify",
            icon: ShieldCheck,
            tone: "success",
            disabled: row.isVerified && !isAdmin,
            onClick: () => onVerify?.(row),
          });
        }

        if (canPublish && !row.isLocked) {
          actions.push({
            key: "publish",
            label: row.isPublished ? "Unpublish" : "Publish",
            icon: Megaphone,
            tone: "info",
            disabled: row.isPublished && !isAdmin,
            onClick: () => onPublish?.(row),
          });
        }

        if (canLock && (row.isPublished || row.isLocked)) {
          actions.push({
            key: "lock",
            label: row.isLocked ? "Unlock" : "Lock",
            icon: row.isLocked ? LockOpen : Lock,
            tone: "warning",
            disabled: row.isLocked && !isAdmin,
            onClick: () => onLock?.(row),
          });
        }

        if (canWrite) {
          actions.push({
            key: "archive",
            label: "Archive",
            icon: Archive,
            tone: "danger",
            disabled: row.isLocked && !isAdmin,
            onClick: () => onArchive?.(row),
          });
        }

        return actions;
      }}
    />
  );
}
