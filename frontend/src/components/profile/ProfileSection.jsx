import { H3 } from "../ui/Typography";

/**
 * Titled grid section for profile drawers.
 */
export default function ProfileSection({ title, children }) {
  return (
    <section className="space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-5)] last:border-b-0 last:pb-0">
      <H3 size="sm">{title}</H3>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
