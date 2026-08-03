import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

import { DashboardPanel, EmptyState } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import StudentTableRow from "./StudentTableRow";

const COLUMNS = [
  { key: "name", label: "Student", sortable: true, className: "" },
  {
    key: "studentId",
    label: "Student ID",
    sortable: true,
    className: "hidden md:table-cell",
  },
  { key: "className", label: "Class", sortable: true, className: "" },
  {
    key: "gender",
    label: "Gender",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  { key: "status", label: "Status", sortable: true, className: "" },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
    className: "hidden xl:table-cell",
  },
  { key: "actions", label: "Actions", sortable: false, className: "text-right" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

function compareValues(a, b) {
  const left = (a ?? "").toString().toLowerCase();
  const right = (b ?? "").toString().toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function SortIcon({ active, direction }) {
  if (!active) {
    return <ArrowUpDown size={14} className="opacity-50" aria-hidden />;
  }
  return direction === "asc" ? (
    <ArrowUp size={14} aria-hidden />
  ) : (
    <ArrowDown size={14} aria-hidden />
  );
}

export default function StudentTable({
  students,
  onView,
  onEdit,
  onDelete,
  onRestore,
  mode = "active",
  title,
  description,
}) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isArchived = mode === "archived";
  const isEmpty = students.length === 0;

  const sortedStudents = useMemo(() => {
    const next = [...students];
    next.sort((a, b) => {
      const result = compareValues(a[sortKey], b[sortKey]);
      return sortDirection === "asc" ? result : -result;
    });
    return next;
  }, [students, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedStudents.length);
  const pageRows = sortedStudents.slice(startIndex, endIndex);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <DashboardPanel
      title={
        title ||
        (isArchived ? "Archived Students" : "Student Directory")
      }
      description={
        description ||
        (isArchived
          ? "Soft-deleted student records. Restore to return them to the active directory."
          : "Browse student records. Use actions to view, edit, or archive.")
      }
    >
      {isEmpty ? (
        <EmptyState
          icon={GraduationCap}
          title={isArchived ? "No archived students" : "No students found"}
          description={
            isArchived
              ? "Archived records will appear here after soft-delete."
              : "Try adjusting search or filters, or register a new student."
          }
        />
      ) : (
        <>
          <div className="-mx-[var(--space-6)] overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-table-header-bg)]">
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        "px-[var(--space-4)] py-[var(--space-3)] text-left text-[length:var(--font-size-xs)] font-[number:var(--font-weight-bold)] uppercase tracking-wider text-[var(--color-table-muted)] md:px-[var(--space-6)]",
                        column.className
                      )}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className="inline-flex items-center gap-[var(--space-1)] transition-colors hover:text-[var(--color-text-primary)]"
                        >
                          {column.label}
                          <SortIcon
                            active={sortKey === column.key}
                            direction={sortDirection}
                          />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--color-table-bg)]">
                {pageRows.map((student) => (
                  <StudentTableRow
                    key={student.id}
                    student={student}
                    mode={mode}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border-muted)] pt-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
            <Caption variant="muted" size="sm" className="m-0">
              Showing {sortedStudents.length === 0 ? 0 : startIndex + 1}–
              {endIndex} of {sortedStudents.length}
            </Caption>

            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
              <label className="flex items-center gap-[var(--space-2)] text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Rows
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="h-9 rounded-[var(--radius-lg)] border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-[var(--space-2)] text-[length:var(--font-size-sm)] outline-none focus:border-[var(--color-input-border-focus)]"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-[var(--space-2)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-auto px-[var(--space-3)]"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={16} aria-hidden />
                  Prev
                </Button>
                <Caption variant="muted" size="sm" className="m-0 tabular-nums">
                  {currentPage} / {totalPages}
                </Caption>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-auto px-[var(--space-3)]"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                  <ChevronRight size={16} aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardPanel>
  );
}
