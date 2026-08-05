import { BookOpen, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";

const COLUMNS = [
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
          {row.subjectName}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.subjectCode}
          {row.shortName ? ` · ${row.shortName}` : ""}
        </Caption>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    sortable: true,
    className: "hidden md:table-cell",
  },
  {
    key: "creditHours",
    label: "Credits",
    sortable: true,
    className: "hidden md:table-cell",
  },
  {
    key: "departmentName",
    label: "Department",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => row.departmentName || "—",
  },
  {
    key: "schoolClassName",
    label: "Class",
    sortable: true,
    className: "hidden xl:table-cell",
    render: (row) => row.schoolClassName || "—",
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
 * Active / archived subject directory powered by shared DataTable.
 */
export default function SubjectList({
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
  sortKey = "subjectName",
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
            id: "subject-status-filter",
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
      title={title || (isArchived ? "Archived Subjects" : "Subject Directory")}
      description={
        description ||
        (isArchived
          ? "Soft-deleted subjects. Restore to return them to the active directory."
          : "Manage academic subjects, categories, credit hours, and departments.")
      }
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      emptyIcon={BookOpen}
      emptyTitle={isArchived ? "No archived subjects" : "No subjects found"}
      emptyDescription={
        isArchived
          ? "Archived records will appear here after soft-delete."
          : "Try adjusting search or filters, or create a new subject."
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
      searchLabel={isArchived ? "Search archived" : "Search subjects"}
      searchPlaceholder="Search by code, name, short name, or department…"
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
              Add Subject
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
