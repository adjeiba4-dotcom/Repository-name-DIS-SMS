import {
  Archive,
  ClipboardList,
  Eye,
  FileCheck2,
  Pencil,
  RotateCcw,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { ASSESSMENT_TYPE_OPTIONS } from "./assessment.mappers";

const COLUMNS = [
  {
    key: "title",
    label: "Assessment",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.title || "—"}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.assessmentTypeLabel} · {row.assessmentDateLabel}
        </Caption>
      </div>
    ),
  },
  {
    key: "classLabel",
    label: "Class",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.className || "—"}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.classCode || ""}
        </Caption>
      </div>
    ),
  },
  {
    key: "subjectLabel",
    label: "Subject",
    sortable: true,
    className: "hidden md:table-cell",
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.subjectName || "—"}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.subjectCode || ""}
        </Caption>
      </div>
    ),
  },
  {
    key: "teacherName",
    label: "Teacher",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => row.teacherName || "—",
  },
  {
    key: "maxMarks",
    label: "Max",
    sortable: true,
    render: (row) => row.maxMarks ?? "—",
  },
  {
    key: "scoreCount",
    label: "Scores",
    sortable: true,
    className: "hidden xl:table-cell",
    render: (row) => row.scoreCount ?? 0,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => <StatusBadge status={row.status} label={row.status} />,
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
  },
];

export default function AssessmentList({
  title = "Assessment Directory",
  description = "Class assessments scoped by academic year and term.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  status = "all",
  assessmentType = "all",
  sortKey = "assessmentDateLabel",
  sortDirection = "desc",
  archivedView = false,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onView,
  onEdit,
  onScores,
  onArchive,
  onRestore,
  onAdd,
  onExportExcel,
  onExportPdf,
  onPrint,
  emptyActionLabel,
  onEmptyAction,
  className = "",
}) {
  const filters = [
    onTypeChange
      ? {
          id: "assessment-type-filter",
          label: "Type",
          value: assessmentType,
          onChange: onTypeChange,
          options: [
            { value: "all", label: "All types" },
            ...ASSESSMENT_TYPE_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            })),
          ],
        }
      : null,
    onStatusChange && !archivedView
      ? {
          id: "assessment-status-filter",
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: [
            { value: "all", label: "All statuses" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
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
      emptyIcon={FileCheck2}
      emptyTitle={
        archivedView ? "No archived assessments" : "No assessments found"
      }
      emptyDescription="Try adjusting filters or create a new assessment."
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
      searchLabel="Search assessments"
      searchPlaceholder="Search class, subject, teacher, or type…"
      onSearchChange={onSearchChange}
      filters={filters}
      toolbarActions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            onPrint={onPrint}
            disabled={rows.length === 0}
          />
          {onAdd && !archivedView ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={onAdd}
              disabled={loading}
            >
              New Assessment
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
          {
            key: "scores",
            label: "Enter scores",
            icon: ClipboardList,
            tone: "info",
            onClick: () => onScores?.(row),
          },
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            tone: "success",
            onClick: () => onEdit?.(row),
          },
          {
            key: "archive",
            label: "Archive",
            icon: Archive,
            tone: "danger",
            onClick: () => onArchive?.(row),
          },
        ];
      }}
    />
  );
}
