import { Body, Caption } from "../ui/Typography";

/**
 * Labeled icon + value row for profile drawers.
 */
export default function ProfileDetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-[var(--space-3)]">
      <div
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
        aria-hidden
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <Caption variant="muted" size="sm" className="m-0">
          {label}
        </Caption>
        <Body
          variant="default"
          size="sm"
          className="m-0 break-words font-[number:var(--font-weight-semibold)]"
        >
          {value || "—"}
        </Body>
      </div>
    </div>
  );
}
