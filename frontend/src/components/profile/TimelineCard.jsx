// components/profile/TimelineCard.jsx

import Card from "../ui/Card";
import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";
import StatusBadge from "./StatusBadge";

/**
 * Generic vertical timeline card.
 * events: [{
 *   id?, title, description?, timestamp?, status?, statusLabel?, statusVariant?, icon?
 * }]
 */
export default function TimelineCard({
  title = "Timeline",
  description,
  events = [],
  emptyMessage = "No activity yet.",
  className = "",
  size = "md",
  variant = "default",
  ...props
}) {
  return (
    <Card
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    >
      <div className="mb-[var(--space-5)] space-y-[var(--space-1)]">
        <H3 size="sm">{title}</H3>
        {description ? (
          <Body variant="muted" size="sm" className="m-0">
            {description}
          </Body>
        ) : null}
      </div>

      {events.length === 0 ? (
        <Caption variant="muted" size="sm" className="m-0">
          {emptyMessage}
        </Caption>
      ) : (
        <ol className="relative space-y-[var(--space-5)] border-l border-[var(--color-border-muted)] pl-[var(--space-5)]">
          {events.map((event, index) => {
            const Icon = event.icon;
            const key = event.id ?? `${event.title}-${index}`;

            return (
              <li key={key} className="relative">
                <span
                  className={cn(
                    "absolute -left-[calc(var(--space-5)+0.4rem)] top-1",
                    "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full",
                    "bg-[var(--color-brand-600)] ring-4 ring-[var(--color-surface-default)]"
                  )}
                  aria-hidden
                />

                <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-[var(--space-1)]">
                    <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                      {Icon ? (
                        <Icon
                          size={14}
                          className="text-[var(--color-text-secondary)]"
                          aria-hidden
                        />
                      ) : null}
                      <Body
                        variant="default"
                        size="sm"
                        className="m-0 font-[number:var(--font-weight-semibold)]"
                      >
                        {event.title}
                      </Body>
                      {(event.status || event.statusLabel) && (
                        <StatusBadge
                          status={event.status}
                          label={event.statusLabel}
                          variant={event.statusVariant}
                        />
                      )}
                    </div>
                    {event.description ? (
                      <Body variant="muted" size="sm" className="m-0">
                        {event.description}
                      </Body>
                    ) : null}
                  </div>

                  {event.timestamp ? (
                    <Caption
                      variant="muted"
                      size="sm"
                      className="m-0 shrink-0 tabular-nums"
                    >
                      {event.timestamp}
                    </Caption>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
