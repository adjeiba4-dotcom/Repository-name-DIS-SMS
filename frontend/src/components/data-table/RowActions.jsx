// components/data-table/RowActions.jsx

import { cn } from "../../utils/cn";

const TONE_CLASS = {
  brand:
    "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]",
  success:
    "text-[var(--color-success-700)] hover:bg-[var(--color-success-100)]",
  danger:
    "text-[var(--color-danger-700)] hover:bg-[var(--color-danger-100)]",
  secondary:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]",
};

const actionButtonClass = cn(
  "inline-flex items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)]",
  "transition-[background-color,color] duration-[var(--transition-fast)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

/**
 * Generic row action icon buttons.
 * actions: [{ key, label, icon, onClick, tone?, disabled? }]
 */
export default function RowActions({ actions = [], className = "" }) {
  if (!actions.length) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-end gap-[var(--space-1)]",
        className
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const tone = action.tone || "brand";

        return (
          <button
            key={action.key}
            type="button"
            title={action.label}
            aria-label={action.label}
            disabled={action.disabled}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick?.(event);
            }}
            className={cn(actionButtonClass, TONE_CLASS[tone] || TONE_CLASS.brand)}
          >
            {Icon ? <Icon size={16} aria-hidden /> : action.label}
          </button>
        );
      })}
    </div>
  );
}
