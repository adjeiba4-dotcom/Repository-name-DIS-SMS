import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";

const STATUS_BADGE = {
  Active: "success",
  Inactive: "warning",
  Archived: "secondary",
};

const actionButtonClass =
  "inline-flex items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)] transition-[background-color,color] duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function TeacherTableRow({
  teacher,
  mode = "active",
  onView,
  onEdit,
  onDelete,
  onRestore,
}) {
  const isArchived = mode === "archived";
  const photoSrc = teacher.photoUrl || teacher.avatarUrl || "";

  return (
    <tr
      className={cn(
        "border-t border-[var(--color-table-border)] transition-colors duration-[var(--transition-fast)] hover:bg-[var(--color-table-row-hover)]",
        isArchived && "bg-[var(--color-surface-muted)]/40"
      )}
    >
      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <div className="flex min-w-0 items-center gap-[var(--space-3)]">
          <Avatar
            name={teacher.name}
            src={photoSrc || undefined}
            size="sm"
            className={cn(
              !photoSrc && "bg-[var(--color-brand-50)]",
              isArchived && "opacity-80"
            )}
          />
          <div className="min-w-0">
            <Body
              variant="default"
              size="sm"
              className="m-0 truncate font-[number:var(--font-weight-semibold)]"
            >
              {teacher.name}
            </Body>
            <Caption variant="muted" size="sm" className="m-0 truncate">
              {teacher.email || "No email on file"}
            </Caption>
          </div>
        </div>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] md:table-cell md:px-[var(--space-6)]">
        <Body
          variant="default"
          size="sm"
          className="m-0 font-[family-name:var(--font-family-mono)]"
        >
          {teacher.staffNo}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <Body variant="default" size="sm" className="m-0">
          {teacher.department}
        </Body>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] lg:table-cell lg:px-[var(--space-6)]">
        <Body variant="secondary" size="sm" className="m-0">
          {teacher.gender}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <Badge variant={STATUS_BADGE[teacher.status] ?? "secondary"} size="sm">
          {teacher.status}
        </Badge>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] xl:table-cell xl:px-[var(--space-6)]">
        <Body variant="secondary" size="sm" className="m-0">
          {teacher.phone || "—"}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <div className="flex items-center justify-end gap-[var(--space-1)]">
          {!isArchived && (
            <>
              <button
                type="button"
                aria-label={`View ${teacher.name}`}
                title="View profile"
                className={`${actionButtonClass} text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]`}
                onClick={() => onView?.(teacher)}
              >
                <Eye size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Edit ${teacher.name}`}
                title="Edit teacher"
                className={`${actionButtonClass} text-[var(--color-success-600)] hover:bg-[var(--color-success-100)]`}
                onClick={() => onEdit?.(teacher)}
              >
                <Pencil size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Archive ${teacher.name}`}
                title="Archive teacher"
                className={`${actionButtonClass} text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100)]`}
                onClick={() => onDelete?.(teacher)}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </>
          )}

          {isArchived && (
            <button
              type="button"
              aria-label={`Restore ${teacher.name}`}
              title="Restore teacher to active directory"
              className={`${actionButtonClass} text-[var(--color-success-600)] hover:bg-[var(--color-success-100)]`}
              onClick={() => onRestore?.(teacher)}
            >
              <RotateCcw size={16} aria-hidden />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
