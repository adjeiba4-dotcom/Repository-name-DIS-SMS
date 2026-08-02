import { cn } from "../../utils/cn";
import { Body, H1 } from "./Typography";

const variants = {
  default: "border-b border-[var(--color-border-default)] bg-[var(--color-surface-default)]",
  muted: "border-b border-[var(--color-border-muted)] bg-[var(--color-surface-muted)]",
  plain: "bg-transparent",
};

const sizes = {
  sm: "px-4 py-4",
  md: "px-6 py-5",
  lg: "px-8 py-6",
};

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <header
      aria-disabled={disabled || undefined}
      className={cn(
        "w-full",
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.md,
        disabled && "pointer-events-none opacity-60",
        className
      )}
      {...props}
    >
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-2">
          {breadcrumbs}
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {typeof title === "string" ? (
            <H1 size="sm" className="truncate">
              {title}
            </H1>
          ) : (
            title
          )}

          {description &&
            (typeof description === "string" ? (
              <Body variant="muted" size="sm">
                {description}
              </Body>
            ) : (
              description
            ))}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
