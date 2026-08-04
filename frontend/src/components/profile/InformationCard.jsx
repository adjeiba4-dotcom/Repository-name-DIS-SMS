// components/profile/InformationCard.jsx

import Card from "../ui/Card";
import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";

/**
 * Generic labeled information card.
 * items: [{ key?, label, value, icon? }]
 */
export default function InformationCard({
  title,
  description,
  items = [],
  columns = 2,
  actions = null,
  emptyLabel = "—",
  className = "",
  size = "md",
  variant = "default",
  children,
  ...props
}) {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <Card
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className="mb-[var(--space-5)] flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-[var(--space-1)]">
            {title ? <H3 size="sm">{title}</H3> : null}
            {description ? (
              <Body variant="muted" size="sm" className="m-0">
                {description}
              </Body>
            ) : null}
          </div>
          {actions}
        </div>
      )}

      {items.length > 0 ? (
        <div className={cn("grid gap-[var(--space-4)]", gridClass)}>
          {items.map((item, index) => {
            const Icon = item.icon;
            const key = item.key || `${item.label}-${index}`;

            return (
              <div key={key} className="flex items-start gap-[var(--space-3)]">
                {Icon ? (
                  <div
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
                    aria-hidden
                  >
                    <Icon size={16} />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <Caption variant="muted" size="sm" className="m-0">
                    {item.label}
                  </Caption>
                  <Body
                    variant="default"
                    size="sm"
                    className="m-0 break-words font-[number:var(--font-weight-semibold)]"
                  >
                    {item.value == null || item.value === ""
                      ? emptyLabel
                      : item.value}
                  </Body>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {children}
    </Card>
  );
}
