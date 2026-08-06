import { ClipboardCheck, Eye, Pencil, Trash2 } from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { ATTENDANCE_STATUS_MAP } from "./attendance.mappers";

const COLUMNS = [
  {
    key: "attendanceDateLabel",
    label: "Date",
    sortable: true,
  },
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
          {row.firstName || row.lastName
            ? `${row.firstName} ${row.lastName}`.trim()
            : row.studentName || "—"}
        </Body>
        <Caption variant="muted" size="sm" className="m-0 truncate">
          {row.admissionNo || ""}
        </Caption>
      </div>
    ),
  },
  {
    key: "classLabel",
    label: "Class",
    sortable: true,
    className: "hidden md:table-cell",
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
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => (
      <StatusBadge
        status={row.status}
        label={row.status}
        statusMap={ATTENDANCE_STATUS_MAP}
      />
    ),
  },
  {
    key: "termName",
    label: "Term",
    sortable: true,
    className: "hidden lg:table-cell",
    render: (row) => row.termName || "—",
  },
  {
    key: "remarks",
    label: "Remarks",
    className: "hidden xl:table-cell",
    render: (row) => row.remarks || "—",
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
  },
];

export default function AttendanceList({
  title = "Attendance Directory",
  description = "Recorded student attendance for the selected scope.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  status = "all",
  sortKey = "attendanceDateLabel",
  sortDirection = "desc",
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
          id: "attendance-status-filter",
          label: "Status",
          value: status,
          onChange: onStatusChange,
          options: [
            { value: "all", label: "All statuses" },
            { value: "Present", label: "Present" },
            { value: "Absent", label: "Absent" },
            { value: "Late", label: "Late" },
            { value: "Excused", label: "Excused" },
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
      emptyIcon={ClipboardCheck}
      emptyTitle="No attendance records found"
      emptyDescription="Try adjusting filters or record attendance for a class."
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
      searchLabel="Search attendance"
      searchPlaceholder="Search student, class, or admission no…"
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
              Record Attendance
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
          disabled: !row.id || String(row.id).startsWith("draft-"),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          tone: "danger",
          onClick: () => onDelete?.(row),
          disabled: !row.id || String(row.id).startsWith("draft-"),
        },
      ]}
    />
  );
}
