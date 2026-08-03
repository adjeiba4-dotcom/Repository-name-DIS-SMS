import { CalendarDays } from "lucide-react";

import { DashboardPanel } from "../../../components/dashboard";
import Badge from "../../../components/ui/Badge";
import { Body, Caption, H1 } from "../../../components/ui/Typography";
import useAuth from "../../../hooks/useAuth";

function displayName(user) {
  if (!user) return "Administrator";
  return (
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Administrator"
  );
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function WelcomeBanner() {
  const { user } = useAuth();
  const name = displayName(user);

  return (
    <DashboardPanel
      size="md"
      className="border-[var(--color-border-default)] bg-[linear-gradient(135deg,var(--color-brand-50)_0%,var(--color-surface-default)_48%,var(--color-surface-muted)_100%)]"
    >
      <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-[var(--space-2)]">
          <Badge variant="primary" size="sm">
            Executive Overview
          </Badge>
          <H1 size="sm" className="text-balance">
            Welcome back, {name}
          </H1>
          <Body variant="secondary" size="sm" className="max-w-2xl">
            Your school operations snapshot. Metrics below are placeholders until
            live summaries are wired in.
          </Body>
        </div>

        <div className="flex shrink-0 items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-[var(--space-3)] py-[var(--space-2)] shadow-[var(--shadow-sm)]">
          <CalendarDays
            size={16}
            className="text-[var(--color-brand-600)]"
            aria-hidden
          />
          <Caption variant="secondary" size="sm" className="m-0">
            {formatToday()}
          </Caption>
        </div>
      </div>
    </DashboardPanel>
  );
}
