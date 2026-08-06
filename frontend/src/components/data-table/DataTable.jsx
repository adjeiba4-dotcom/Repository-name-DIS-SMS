// components/data-table/DataTable.jsx

import { useId } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
} from "lucide-react";

import { EmptyState, Panel } from "../dashboard";
import Input from "../ui/Input";
import { DataTableSkeleton } from "../ui/Skeleton";
import { Caption } from "../ui/Typography";
import { cn } from "../../utils/cn";
import {
  fieldLabelClassName,
  selectControlClassName,
  fieldShellState,
} from "../form/fieldStyles";
import RowActions from "./RowActions";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

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

/**
 * Enterprise DataTable with server-side pagination, search, sorting, and filters.
 *
 * columns: [{
 *   key, label, sortable?, className?, align?: 'left'|'right'|'center',
 *   render?: (row, index) => ReactNode
 * }]
 *
 * filters: [{
 *   id, label, value, options: [{value,label}], onChange, placeholder?
 * }]
 *
 * getRowActions?: (row) => [{ key, label, icon, onClick, tone?, disabled? }]
 */
export default function DataTable({
  title,
  description,
  columns = [],
  rows = [],
  rowKey = (row) => row.id,
  loading = false,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting search or filters.",
  emptyActionLabel,
  onEmptyAction,
  emptyIllustration = "inbox",

  // Server-side pagination
  page = 1,
  pageSize = 10,
  total = 0,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,

  // Sorting (server-driven)
  sortKey,
  sortDirection = "asc",
  onSortChange,

  // Search (server-driven)
  searchable = false,
  search = "",
  searchLabel = "Search",
  searchPlaceholder = "Search…",
  onSearchChange,

  // Filters (server-driven)
  filters = [],

  // Optional toolbar slot (right side actions: export, add, etc.)
  toolbarActions = null,

  // Row actions
  getRowActions,

  // Row click / styling
  onRowClick,
  mutedRows = false,
  zebra = true,

  className = "",
  panelProps = {},
}) {
  const searchId = useId();
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);
  const isEmpty = !loading && rows.length === 0;

  const handleSort = (key) => {
    if (!onSortChange) return;
    if (sortKey === key) {
      onSortChange({
        key,
        direction: sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  const showToolbar =
    searchable || filters.length > 0 || Boolean(toolbarActions);

  return (
    <div className={cn("space-y-[var(--space-4)]", className)}>
      {showToolbar ? (
        <div className="ds-table-toolbar">
          <div className="ds-table-toolbar__filters">
            {searchable ? (
              <Input
                id={searchId}
                label={searchLabel}
                type="search"
                value={search}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                size="sm"
                leftIcon={<Search size={16} />}
                className="mb-0"
                aria-label={searchLabel}
              />
            ) : null}

            {filters.map((filter) => {
              const filterId = filter.id || filter.key;
              return (
                <div key={filterId} className="ds-field">
                  <label htmlFor={filterId} className={fieldLabelClassName}>
                    {filter.label}
                  </label>
                  <div
                    className={fieldShellState({
                      disabled: loading || filter.disabled,
                    })}
                  >
                    <select
                      id={filterId}
                      value={filter.value}
                      onChange={(event) =>
                        filter.onChange?.(event.target.value)
                      }
                      disabled={loading || filter.disabled}
                      className={cn(selectControlClassName, "h-10")}
                    >
                      {filter.placeholder !== undefined && (
                        <option value="">{filter.placeholder}</option>
                      )}
                      {(filter.options || []).map((option) => {
                        const optionValue =
                          typeof option === "object" ? option.value : option;
                        const optionLabel =
                          typeof option === "object"
                            ? option.label ?? option.name ?? optionValue
                            : option;
                        return (
                          <option key={String(optionValue)} value={optionValue}>
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {toolbarActions ? (
            <div className="ds-table-toolbar__actions">{toolbarActions}</div>
          ) : null}
        </div>
      ) : null}

      <Panel title={title} description={description} {...panelProps}>
        {loading ? (
          <DataTableSkeleton rows={Math.min(pageSize, 6)} />
        ) : isEmpty ? (
          <EmptyState
            illustration={emptyIllustration}
            icon={EmptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        ) : (
          <>
            <div className="ds-table-scroll -mx-[var(--space-6)]">
              <table className="ds-table">
                <thead className="ds-table__head">
                  <tr>
                    {columns.map((column) => {
                      const align =
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : "text-left";
                      const isSortable = Boolean(
                        column.sortable && onSortChange
                      );

                      return (
                        <th
                          key={column.key}
                          scope="col"
                          className={cn(align, column.className)}
                        >
                          {isSortable ? (
                            <button
                              type="button"
                              onClick={() => handleSort(column.key)}
                              className={cn(
                                "inline-flex items-center gap-[var(--space-1)] transition-colors hover:text-[var(--color-text-primary)]",
                                column.align === "right" && "ml-auto",
                                column.align === "center" && "mx-auto"
                              )}
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
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const key = rowKey(row, index);
                    const actions = getRowActions?.(row, index) || [];

                    return (
                      <tr
                        key={key}
                        onClick={
                          onRowClick ? () => onRowClick(row, index) : undefined
                        }
                        className={cn(
                          "ds-table__row",
                          zebra && index % 2 === 1 && "ds-table__row--zebra",
                          mutedRows && "ds-table__row--muted",
                          onRowClick && "ds-table__row--clickable"
                        )}
                      >
                        {columns.map((column) => {
                          const align =
                            column.align === "right"
                              ? "text-right"
                              : column.align === "center"
                                ? "text-center"
                                : "text-left";

                          let content;
                          if (column.key === "actions" && getRowActions) {
                            content = <RowActions actions={actions} />;
                          } else if (typeof column.render === "function") {
                            content = column.render(row, index);
                          } else {
                            content = row[column.key] ?? "—";
                          }

                          return (
                            <td
                              key={column.key}
                              className={cn(align, column.className)}
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ds-table__pagination mt-[var(--space-4)]">
              <Caption variant="muted" size="sm" className="m-0">
                Showing {startIndex}–{endIndex} of {total}
              </Caption>

              <div className="ds-table__page-controls">
                <label className="ds-table__page-size">
                  <span>Rows</span>
                  <select
                    value={pageSize}
                    onChange={(event) =>
                      onPageSizeChange?.(Number(event.target.value))
                    }
                    disabled={loading || !onPageSizeChange}
                    aria-label="Rows per page"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="ds-pager" role="group" aria-label="Pagination">
                  <button
                    type="button"
                    className="ds-pager__btn"
                    disabled={currentPage <= 1 || loading || !onPageChange}
                    onClick={() =>
                      onPageChange?.(Math.max(1, currentPage - 1))
                    }
                  >
                    <ChevronLeft size={16} aria-hidden />
                    Prev
                  </button>
                  <span className="ds-pager__status">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="ds-pager__btn"
                    disabled={
                      currentPage >= totalPages || loading || !onPageChange
                    }
                    onClick={() =>
                      onPageChange?.(Math.min(totalPages, currentPage + 1))
                    }
                  >
                    Next
                    <ChevronRight size={16} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
