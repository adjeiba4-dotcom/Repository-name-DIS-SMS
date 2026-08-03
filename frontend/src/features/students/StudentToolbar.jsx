import {
  Archive,
  FileDown,
  FileSpreadsheet,
  Plus,
  Search,
  Users,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import { STUDENT_STATUSES } from "./sampleStudents";

const selectClassName = cn(
  "h-10 w-full rounded-[var(--radius-lg)] border border-[var(--color-input-border)]",
  "bg-[var(--color-input-bg)] px-[var(--space-3)]",
  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)]",
  "outline-none transition-[var(--transition-normal)]",
  "focus:border-[var(--color-input-border-focus)] focus:ring-4 focus:ring-[var(--color-brand-100)]"
);

export default function StudentToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  classFilter,
  onClassFilterChange,
  classOptions = [],
  resultCount,
  totalCount,
  onAddStudent,
  onExportExcel,
  onExportPdf,
  viewMode = "active",
  onViewModeChange,
  disabled = false,
}) {
  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button
          type="button"
          variant={viewMode === "active" ? "primary" : "secondary"}
          size="sm"
          className="w-auto"
          onClick={() => onViewModeChange?.("active")}
          disabled={disabled}
        >
          <Users size={16} aria-hidden />
          Active
        </Button>
        <Button
          type="button"
          variant={viewMode === "archived" ? "primary" : "secondary"}
          size="sm"
          className="w-auto"
          onClick={() => onViewModeChange?.("archived")}
          disabled={disabled}
        >
          <Archive size={16} aria-hidden />
          Archived
        </Button>
      </div>

      <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Search students"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Name, ID, phone, or email…"
            size="sm"
            leftIcon={<Search size={16} />}
            className="mb-0"
            aria-label="Search students"
            disabled={disabled}
          />

          {viewMode === "active" && (
            <div>
              <label
                htmlFor="student-status-filter"
                className="mb-[var(--space-2)] block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
              >
                Status
              </label>
              <select
                id="student-status-filter"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={selectClassName}
                disabled={disabled}
              >
                <option value="all">All statuses</option>
                {STUDENT_STATUSES.filter((item) => item !== "Archived").map(
                  (item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="student-class-filter"
              className="mb-[var(--space-2)] block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
            >
              Class
            </label>
            <select
              id="student-class-filter"
              value={classFilter}
              onChange={(e) => onClassFilterChange(e.target.value)}
              className={selectClassName}
              disabled={disabled}
            >
              <option value="all">All classes</option>
              {classOptions.map((item) => (
                <option key={item.value} value={item.name ?? item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-[var(--space-2)] sm:items-end">
          <Caption variant="muted" size="sm" className="m-0 sm:text-right">
            Showing {resultCount} of {totalCount}{" "}
            {viewMode === "archived" ? "archived" : "students"}
          </Caption>

          <div className="flex flex-wrap gap-[var(--space-2)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-auto"
              onClick={onExportExcel}
              disabled={disabled || resultCount === 0}
              title="Export filtered rows to Excel"
            >
              <FileSpreadsheet size={16} aria-hidden />
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-auto"
              onClick={onExportPdf}
              disabled={disabled || resultCount === 0}
              title="Export filtered rows to PDF"
            >
              <FileDown size={16} aria-hidden />
              PDF
            </Button>
            {viewMode === "active" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                onClick={onAddStudent}
                disabled={disabled}
              >
                <Plus size={16} aria-hidden />
                Add Student
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
