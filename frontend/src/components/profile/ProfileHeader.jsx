import Avatar from "../ui/Avatar";
import { Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";
import StatusBadge from "./StatusBadge";

/**
 * Identity strip for profile drawers (avatar, name, subtitle, status).
 */
export default function ProfileHeader({
  name,
  subtitle,
  statusLabel,
  statusVariant,
  status,
  photoSrc = "",
  actions = null,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-[var(--space-3)]">
        <Avatar
          name={name}
          src={photoSrc || undefined}
          size="lg"
          className={
            !photoSrc
              ? "bg-[var(--color-brand-50)] ring-[var(--color-brand-100)]"
              : undefined
          }
        />
        <div className="min-w-0">
          <H3 size="sm" className="truncate">
            {name}
          </H3>
          {subtitle != null && subtitle !== "" && (
            <Caption variant="muted" size="sm" className="m-0 truncate">
              {subtitle}
            </Caption>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        {(statusLabel != null && statusLabel !== "") || status ? (
          <StatusBadge
            status={status}
            label={statusLabel}
            variant={statusVariant}
          />
        ) : null}
        {actions}
      </div>
    </div>
  );
}
