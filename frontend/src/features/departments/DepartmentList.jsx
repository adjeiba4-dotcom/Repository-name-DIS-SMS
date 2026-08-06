import { Building2, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";

const COLUMNS = [
  {
    key: "name",
    label: "Department",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.name}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.code}
        </Caption>
      </div>
    ),
  },
  {
    key: "description",
    label: "Description",
    sortable: true,
    className: "hidden md:table-cell",
    render: (row) => row.description || "—",
  },
  {
    key: "teacherCount",
    label: "Teachers",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "subjectCount",
    label: "Subjects",
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
 * Active / archived department directory powered by shared DataTable.
 */
export default function DepartmentList({
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
  sortKey = "name",
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
            id: "department-status-filter",
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
        title || (isArchived ? "Archived Departments" : "Department Directory")
      }
      description={
        description ||
        (isArchived
          ? "Soft-deleted departments. Restore to return them to the active directory."
          : "Manage academic departments used by teachers, subjects, and classes.")
      }
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      emptyIcon={Building2}
      emptyTitle={
        isArchived ? "No archived departments" : "No departments found"
      }
      emptyDescription={
        isArchived
          ? "Archived records will appear here after soft-delete."
          : "Try adjusting search or filters, or create a new department."
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
      searchLabel={isArchived ? "Search archived" : "Search departments"}
      searchPlaceholder="Search by code or name…"
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
              Add Department
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
