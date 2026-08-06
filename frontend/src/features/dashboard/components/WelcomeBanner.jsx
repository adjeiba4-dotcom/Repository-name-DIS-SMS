import { CalendarDays } from "lucide-react";

import PageHeader from "../../../components/ui/PageHeader";
import Badge from "../../../components/ui/Badge";
import useAuth from "../../../hooks/useAuth";
import { getUserDisplayName } from "../../../utils/userDisplay";

function formatToday() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

/**
 * Executive welcome header — uses shared PageHeader for module consistency.
 */
export default function WelcomeBanner() {
  const { user } = useAuth();
  const name = getUserDisplayName(user);

  return (
    <PageHeader
      variant="default"
      eyebrow="Executive Overview"
      breadcrumbs={[
        { label: "Home", to: "/" },
        { label: "Dashboard" },
      ]}
      title={`Welcome back, ${name}`}
      description="Executive school operations snapshot. KPI values below are placeholders until live summaries are connected."
      actions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <Badge variant="primary" size="sm" rounded={false}>
            Live Workspace
          </Badge>
          <div className="inline-flex items-center gap-[var(--space-2)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-[var(--space-3)] py-[var(--space-2)]">
            <CalendarDays
              size={16}
              className="text-[var(--color-ocean-blue)]"
              aria-hidden
            />
            <span className="text-[length:var(--font-size-xs)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
              {formatToday()}
            </span>
          </div>
        </div>
      }
    />
  );
}
