import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { Body, Caption } from "../../components/ui/Typography";

const STATUS_BADGE = {
  Active: "success",
  Inactive: "warning",
  Archived: "secondary",
};

const actionButtonClass =
  "inline-flex items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)] transition-[background-color,color] duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function StudentTableRow({
  student,
  mode = "active",
  onView,
  onEdit,
  onDelete,
  onRestore,
}) {
  const isArchived = mode === "archived";
  const photoSrc = student.photoUrl || student.avatarUrl || "";

  return (
    <tr className="border-t border-[var(--color-table-border)] transition-colors duration-[var(--transition-fast)] hover:bg-[var(--color-table-row-hover)]">
      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <div className="flex min-w-0 items-center gap-[var(--space-3)]">
          <Avatar
            name={student.name}
            src={photoSrc || undefined}
            size="sm"
            className={!photoSrc ? "bg-[var(--color-brand-50)]" : undefined}
          />
          <div className="min-w-0">
            <Body
              variant="default"
              size="sm"
              className="m-0 truncate font-[number:var(--font-weight-semibold)]"
            >
              {student.name}
            </Body>
            <Caption variant="muted" size="sm" className="m-0 truncate">
              {student.email || "No email on file"}
            </Caption>
          </div>
        </div>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] md:table-cell md:px-[var(--space-6)]">
        <Body variant="default" size="sm" className="m-0 font-[family-name:var(--font-family-mono)]">
          {student.studentId}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <Body variant="default" size="sm" className="m-0">
          {student.className}
        </Body>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] lg:table-cell lg:px-[var(--space-6)]">
        <Body variant="secondary" size="sm" className="m-0">
          {student.gender}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <Badge variant={STATUS_BADGE[student.status] ?? "secondary"} size="sm">
          {student.status}
        </Badge>
      </td>

      <td className="hidden px-[var(--space-4)] py-[var(--space-4)] xl:table-cell xl:px-[var(--space-6)]">
        <Body variant="secondary" size="sm" className="m-0">
          {student.phone || "—"}
        </Body>
      </td>

      <td className="px-[var(--space-4)] py-[var(--space-4)] md:px-[var(--space-6)]">
        <div className="flex items-center justify-end gap-[var(--space-1)]">
          {!isArchived && (
            <>
              <button
                type="button"
                aria-label={`View ${student.name}`}
                title="View profile"
                className={`${actionButtonClass} text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]`}
                onClick={() => onView?.(student)}
              >
                <Eye size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Edit ${student.name}`}
                title="Edit student"
                className={`${actionButtonClass} text-[var(--color-success-600)] hover:bg-[var(--color-success-100)]`}
                onClick={() => onEdit?.(student)}
              >
                <Pencil size={16} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Archive ${student.name}`}
                title="Archive student"
                className={`${actionButtonClass} text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100)]`}
                onClick={() => onDelete?.(student)}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </>
          )}

          {isArchived && (
            <button
              type="button"
              aria-label={`Restore ${student.name}`}
              title="Restore student"
              className={`${actionButtonClass} text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]`}
              onClick={() => onRestore?.(student)}
            >
              <RotateCcw size={16} aria-hidden />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
