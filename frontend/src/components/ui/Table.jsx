import { Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";

import Badge from "./Badge";
import Button from "./Button";

const variants = {
  default: "border-[var(--color-table-border)] bg-[var(--color-table-bg)] shadow-[var(--shadow-lg)]",
  outlined: "border-[var(--color-table-border)] bg-[var(--color-table-bg)] shadow-none",
  muted: "border-[var(--color-border-muted)] bg-[var(--color-surface-muted)] shadow-none",
};

const sizes = {
  sm: "rounded-[var(--radius-lg)] text-[length:var(--font-size-sm)]",
  md: "rounded-[var(--radius-xl)] text-[length:var(--font-size-sm)]",
  lg: "rounded-[var(--radius-2xl)] text-[length:var(--font-size-base)]",
};

export default function Table({
  title = "",
  columns = [],
  data = [],
  emptyMessage = "No records found.",
  variant = "default",
  size = "lg",
  disabled = false,
  className = "",
}) {
  return (
    <div
      aria-disabled={disabled || undefined}
      className={cn(
        "overflow-hidden border",
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.lg,
        disabled && "pointer-events-none opacity-60",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-table-border)] bg-[var(--color-table-header-bg)] px-6 py-5">
        <h2 className="text-[length:var(--font-size-xl)] font-[number:var(--font-weight-semibold)] text-[var(--color-table-text)]">
          {title}
        </h2>

        <Button className="w-auto">+ Add Student</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--color-surface-muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className="px-6 py-4 text-left text-[length:var(--font-size-xs)] font-[number:var(--font-weight-bold)] uppercase tracking-wider text-[var(--color-table-muted)]"
                >
                  {column.header}
                </th>
              ))}

              <th
                scope="col"
                className="px-6 py-4 text-center text-[length:var(--font-size-xs)] font-[number:var(--font-weight-bold)] uppercase tracking-wider text-[var(--color-table-muted)]"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-16 text-center text-[var(--color-table-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--color-table-border)] hover:bg-[var(--color-table-row-hover)]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-6 py-4 text-[var(--color-table-text)]"
                    >
                      {column.accessor === "status" ? (
                        <Badge
                          variant={
                            row.status === "Active" ? "success" : "warning"
                          }
                        >
                          {row.status}
                        </Badge>
                      ) : (
                        row[column.accessor]
                      )}
                    </td>
                  ))}

                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        aria-label="View row"
                        className="rounded-[var(--radius-lg)] p-2 text-[var(--color-brand-600)] transition hover:bg-[var(--color-brand-100)]"
                      >
                        <Eye size={18} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        aria-label="Edit row"
                        className="rounded-[var(--radius-lg)] p-2 text-[var(--color-success-600)] transition hover:bg-[var(--color-success-100)]"
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        aria-label="Delete row"
                        className="rounded-[var(--radius-lg)] p-2 text-[var(--color-danger-600)] transition hover:bg-[var(--color-danger-100)]"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-table-border)] bg-[var(--color-table-header-bg)] px-6 py-4">
        <p className="text-[length:var(--font-size-sm)] text-[var(--color-table-muted)]">
          Showing {data.length} record(s)
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="w-auto">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="w-auto">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
