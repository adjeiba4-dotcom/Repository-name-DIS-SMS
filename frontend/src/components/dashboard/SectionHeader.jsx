import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";

/**
 * Shared dashboard section / panel heading.
 * Supports optional eyebrow, description, and trailing actions.
 */
export default function SectionHeader({
  title,
  description,
  eyebrow,
  titleId,
  actions,
  className = "",
  ...props
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-[var(--space-3)]",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 space-y-[var(--space-1)]">
        {eyebrow && (
          <Caption
            variant="muted"
            size="sm"
            className="m-0 font-[number:var(--font-weight-semibold)] uppercase tracking-[0.06em]"
          >
            {eyebrow}
          </Caption>
        )}
        <H3 id={titleId} size="sm">
          {title}
        </H3>
        {description && (
          <Body variant="muted" size="sm" className="m-0">
            {description}
          </Body>
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
