import { CalendarClock, Eye, Pencil, Trash2 } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";

const COLUMNS = [
  {
    key: "dayLabel",
    label: "Day",
    sortable: true,
  },
  {
    key: "timeRange",
    label: "Time",
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <Body
          variant="default"
          size="sm"
          className="m-0 truncate font-[number:var(--font-weight-semibold)]"
        >
          {row.timeRange || "—"}
        </Body>
        {row.room ? (
          <Caption variant="muted" size="sm" className="m-0 truncate">
            {row.room}
          </Caption>
        ) : null}
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
 * Class / Teacher / Subject directory powered by shared DataTable.
 */
export default function TimetableList({
  title = "Timetable Directory",
  description = "Scheduled periods for the selected academic year and term.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  status = "all",
  sortKey = "dayLabel",
  sortDirection = "asc",
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onExportExcel,
  onExportPdf,
  onPrint,
  emptyActionLabel,
  onEmptyAction,
  className = "",
}) {
  const filters = onStatusChange
    ? [
        {
          id: "timetable-status-filter",
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
      title={title}
      description={description}
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      emptyIcon={CalendarClock}
      emptyTitle="No timetable slots found"
      emptyDescription="Try adjusting filters or add a new period slot."
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
      searchLabel="Search timetable"
      searchPlaceholder="Search class, subject, teacher, room…"
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
          {onAdd ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={onAdd}
              disabled={loading}
            >
              Add Slot
            </Button>
          ) : null}
        </div>
      }
      getRowActions={(row) => [
        {
          key: "view",
          label: "View details",
          icon: Eye,
          tone: "brand",
          onClick: () => onView?.(row),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          tone: "success",
          onClick: () => onEdit?.(row),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          tone: "danger",
          onClick: () => onDelete?.(row),
        },
      ]}
    />
  );
}
