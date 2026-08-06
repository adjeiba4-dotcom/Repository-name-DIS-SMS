import {
  Archive,
  ClipboardList,
  Eye,
  FileCheck2,
  Lock,
  LockOpen,
  Pencil,
  RotateCcw,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { EXAMINATION_TYPE_OPTIONS } from "./examination.mappers";

const COLUMNS = [
  {
    key: "name",
    label: "Examination",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.name || "—"}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.examinationTypeLabel} · {row.examinationDateLabel}
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
    label: "Max / Pass",
    sortable: true,
    render: (row) => `${row.maxMarks ?? "—"} / ${row.passingMarks ?? "—"}`,
  },
  {
    key: "durationLabel",
    label: "Duration",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => row.durationLabel || "—",
  },
  {
    key: "isLocked",
    label: "Locked",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "inline-flex rounded-full px-[var(--space-2)] py-0.5 text-[length:var(--font-size-xs)] font-[number:var(--font-weight-semibold)]",
          row.isLocked
            ? "bg-[var(--color-warning-100)] text-[var(--color-warning-700)]"
            : "bg-[var(--color-success-100)] text-[var(--color-success-700)]"
        )}
      >
        {row.isLocked ? "Locked" : "Open"}
      </span>
    ),
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

export default function ExaminationList({
  title = "Examination Directory",
  description = "Class examinations scoped by academic year and term.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  status = "all",
  examinationType = "all",
  sortKey = "examinationDateLabel",
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
  onToggleLock,
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
          id: "examination-type-filter",
          label: "Type",
          value: examinationType,
          onChange: onTypeChange,
          options: [
            { value: "all", label: "All types" },
            ...EXAMINATION_TYPE_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            })),
          ],
        }
      : null,
    onStatusChange && !archivedView
      ? {
          id: "examination-status-filter",
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
        archivedView ? "No archived examinations" : "No examinations found"
      }
      emptyDescription="Try adjusting filters or create a new examination."
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
      searchLabel="Search examinations"
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
              New Examination
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
            disabled: row.isLocked,
            onClick: () => onScores?.(row),
          },
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            tone: "success",
            disabled: row.isLocked,
            onClick: () => onEdit?.(row),
          },
          ...(row.isLocked
            ? [
                {
                  key: "unlock",
                  label: "Unlock",
                  icon: LockOpen,
                  tone: "warning",
                  onClick: () => onToggleLock?.(row),
                },
              ]
            : [
                {
                  key: "lock",
                  label: "Lock",
                  icon: Lock,
                  tone: "warning",
                  onClick: () => onToggleLock?.(row),
                },
              ]),
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
