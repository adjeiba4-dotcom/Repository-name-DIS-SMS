import { BookMarked, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";

const COLUMNS = [
  {
    key: "className",
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
    key: "subjectName",
    label: "Subject",
    sortable: true,
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
    className: "hidden md:table-cell",
    render: (row) => row.teacherName || "—",
  },
  {
    key: "academicYearName",
    label: "Academic Year",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => row.academicYearName || "—",
  },
  {
    key: "termName",
    label: "Term",
    sortable: true,
    className: "hidden xl:table-cell",
    render: (row) => row.termName || "All terms",
  },
  {
    key: "weeklyPeriods",
    label: "Periods/wk",
    sortable: true,
    className: "hidden md:table-cell",
  },
  {
    key: "isCompulsoryLabel",
    label: "Type",
    sortable: true,
    className: "hidden lg:table-cell",
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

/**
 * Active / archived class-subject directory powered by shared DataTable.
 */
export default function ClassSubjectList({
  mode = "active",
  title,
  description,
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  status = "all",
  sortKey = "className",
  sortDirection = "asc",
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onAdd,
  onExportExcel,
  onExportPdf,
  onPrint,
  emptyActionLabel,
  onEmptyAction,
  className = "",
}) {
  const isArchived = mode === "archived";

  const filters =
    !isArchived && onStatusChange
      ? [
          {
            id: "class-subject-status-filter",
            label: "Status",
            value: status,
            onChange: onStatusChange,
            options: [
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ],
          },
        ]
      : [];

  return (
    <DataTable
      className={cn(className)}
      title={
        title ||
        (isArchived
          ? "Archived Class Subjects"
          : "Class Subject Directory")
      }
      description={
        description ||
        (isArchived
          ? "Soft-deleted allocations. Restore to return them to the active directory."
          : "Allocate subjects to classes via teacher subject assignments.")
      }
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      emptyIcon={BookMarked}
      emptyTitle={
        isArchived
          ? "No archived allocations"
          : "No class subject allocations found"
      }
      emptyDescription={
        isArchived
          ? "Archived records will appear here after soft-delete."
          : "Try adjusting search or filters, or create a new allocation."
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
      searchLabel={isArchived ? "Search archived" : "Search allocations"}
      searchPlaceholder="Search by class, subject, teacher, year, or term…"
      onSearchChange={onSearchChange}
      filters={filters}
      mutedRows={isArchived}
      toolbarActions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            onPrint={onPrint}
            disabled={rows.length === 0}
          />
          {!isArchived && onAdd ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={onAdd}
              disabled={loading}
            >
              Add Allocation
            </Button>
          ) : null}
        </div>
      }
      getRowActions={(row) => {
        const actions = [
          {
            key: "view",
            label: "View details",
            icon: Eye,
            tone: "brand",
            onClick: () => onView?.(row),
          },
        ];

        if (isArchived) {
          actions.push({
            key: "restore",
            label: "Restore",
            icon: RotateCcw,
            tone: "success",
            onClick: () => onRestore?.(row),
          });
        } else {
          actions.push(
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
              icon: Trash2,
              tone: "danger",
              onClick: () => onDelete?.(row),
            }
          );
        }

        return actions;
      }}
    />
  );
}
