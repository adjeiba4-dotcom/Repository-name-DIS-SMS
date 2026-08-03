import Button from "../ui/Button";
import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";

/**
 * Placeholder / empty content block for dashboard panels.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionProps = {},
  children,
  className = "",
  ...props
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[var(--radius-lg)]",
        "border border-dashed border-[var(--color-border-strong)]",
        "bg-[linear-gradient(180deg,var(--color-surface-muted)_0%,var(--color-surface-default)_100%)]",
        "px-[var(--space-4)] py-[var(--space-8)]",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-sm text-center">
        {Icon && (
          <div
            className="mx-auto mb-[var(--space-3)] inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
            aria-hidden
          >
            <Icon size={20} />
          </div>
        )}

        {children}

        {title && (
          <H3 size="sm" className="mt-[var(--space-2)]">
            {title}
          </H3>
        )}

        {description &&
          (title ? (
            <Body variant="muted" size="sm" className="m-0 mt-[var(--space-1)]">
              {description}
            </Body>
          ) : (
            <Caption variant="muted" size="sm" className="m-0">
              {description}
            </Caption>
          ))}

        {actionLabel && onAction && (
          <div className="mt-[var(--space-4)] flex justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAction}
              className="w-auto"
              {...actionProps}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
