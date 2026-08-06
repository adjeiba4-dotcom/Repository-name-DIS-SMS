import { FileQuestion, Inbox, SearchX, FolderOpen } from "lucide-react";

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const ILLUSTRATIONS = {
  inbox: {
    Icon: Inbox,
    accents: [
      "var(--color-ocean-blue)",
      "var(--color-accent-cyan)",
      "var(--color-accent-lime)",
    ],
  },
  search: {
    Icon: SearchX,
    accents: [
      "var(--color-accent-cyan)",
      "var(--color-ocean-blue)",
      "var(--color-accent-yellow)",
    ],
  },
  folder: {
    Icon: FolderOpen,
    accents: [
      "var(--color-accent-yellow)",
      "var(--color-ocean-blue)",
      "var(--color-accent-lime)",
    ],
  },
  error: {
    Icon: FileQuestion,
    accents: [
      "var(--color-accent-red)",
      "var(--color-accent-yellow)",
      "var(--color-ocean-blue)",
    ],
  },
};

function EmptyIllustration({ type = "inbox", icon: CustomIcon }) {
  const config = ILLUSTRATIONS[type] ?? ILLUSTRATIONS.inbox;
  const Icon = CustomIcon || config.Icon;

  return (
    <div className="ds-empty__illustration" aria-hidden>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <rect
          x="14"
          y="22"
          width="60"
          height="44"
          stroke={config.accents[0]}
          strokeWidth="2"
          opacity="0.35"
        />
        <rect
          x="22"
          y="30"
          width="28"
          height="4"
          fill={config.accents[1]}
          opacity="0.55"
        />
        <rect
          x="22"
          y="40"
          width="44"
          height="3"
          fill={config.accents[2]}
          opacity="0.35"
        />
        <rect
          x="22"
          y="48"
          width="36"
          height="3"
          fill={config.accents[0]}
          opacity="0.25"
        />
        <circle cx="64" cy="54" r="10" fill="var(--color-surface-default)" />
        <circle
          cx="64"
          cy="54"
          r="9"
          stroke={config.accents[0]}
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
      <span className="absolute inline-flex text-[var(--color-ocean-blue)]">
        <Icon size={22} strokeWidth={1.75} />
      </span>
    </div>
  );
}

/**
 * Polished empty-state for tables, panels, and dashboards.
 */
export default function EmptyState({
  icon: Icon,
  illustration = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  actionProps = {},
  secondaryActionProps = {},
  children,
  className = "",
  ...props
}) {
  return (
    <div className={cn("ds-empty", className)} {...props}>
      <div className="ds-empty__inner">
        <div className="relative mx-auto w-fit">
          <EmptyIllustration type={illustration} icon={Icon} />
        </div>

        {children}

        {title ? <h3 className="ds-empty__title">{title}</h3> : null}

        {description ? (
          <p className="ds-empty__description">{description}</p>
        ) : null}

        {(actionLabel && onAction) ||
        (secondaryActionLabel && onSecondaryAction) ? (
          <div className="ds-empty__actions">
            {actionLabel && onAction ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                onClick={onAction}
                {...actionProps}
              >
                {actionLabel}
              </Button>
            ) : null}
            {secondaryActionLabel && onSecondaryAction ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={onSecondaryAction}
                {...secondaryActionProps}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
