import { BarChart3, CalendarDays } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  SectionHeader,
} from "../../../components/dashboard";
import { Caption } from "../../../components/ui/Typography";
import { cn } from "../../../utils/cn";
import {
  ANALYTICS_PLACEHOLDERS,
  CALENDAR_DAYS,
} from "../data/placeholders";

const BAR_HEIGHTS = [40, 65, 48, 80, 55, 72, 44];
const ACCENT_BARS = [
  "bg-[var(--color-chart-primary)]",
  "bg-[var(--color-chart-primary-soft)]",
  "bg-[var(--color-chart-primary)]",
  "bg-[var(--color-chart-primary-soft)]",
  "bg-[var(--color-chart-primary)]",
  "bg-[var(--color-chart-primary-soft)]",
  "bg-[var(--color-chart-primary)]",
];

function ChartPlaceholder({ caption }) {
  return (
    <EmptyState
      className="ds-widget-placeholder h-52 rounded-[var(--radius-panel)] border-0 bg-transparent py-0"
      role="img"
      aria-label="Chart placeholder"
      description={caption}
    >
      <div
        className="mx-auto mb-[var(--space-3)] flex h-20 w-48 items-end justify-center gap-[var(--space-1)] opacity-70"
        aria-hidden
      >
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={cn("w-3 opacity-40", ACCENT_BARS[i])}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </EmptyState>
  );
}

function CalendarPlaceholder({ caption }) {
  return (
    <div className="ds-widget-placeholder flex-col gap-[var(--space-4)] p-[var(--space-4)]">
      <div className="grid w-full max-w-sm grid-cols-7 gap-[var(--space-2)]">
        {CALENDAR_DAYS.map((cell) => (
          <div
            key={cell.day}
            className={cn(
              "flex flex-col items-center gap-1 border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-[var(--space-1)] py-[var(--space-2)]",
              cell.events > 0 && "border-[var(--color-chart-primary)]"
            )}
          >
            <Caption variant="muted" size="sm" className="m-0">
              {cell.day}
            </Caption>
            <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)]">
              {cell.date}
            </span>
            {cell.events > 0 ? (
              <span
                className="h-1.5 w-1.5 bg-[var(--color-accent-red)]"
                aria-hidden
              />
            ) : (
              <span className="h-1.5 w-1.5" aria-hidden />
            )}
          </div>
        ))}
      </div>
      <Caption variant="muted" size="sm" className="m-0 text-center">
        {caption}
      </Caption>
    </div>
  );
}

function AnalyticsPanel({ panel }) {
  const isCalendar = panel.type === "calendar";

  return (
    <DashboardPanel
      title={panel.title}
      description={panel.description}
      actions={
        <div
          className={cn(
            "ds-kpi-icon",
            isCalendar ? "ds-kpi-icon--yellow" : "ds-kpi-icon--ocean"
          )}
          aria-hidden
        >
          {isCalendar ? <CalendarDays size={18} /> : <BarChart3 size={18} />}
        </div>
      }
    >
      {isCalendar ? (
        <CalendarPlaceholder caption={panel.caption} />
      ) : (
        <ChartPlaceholder caption={panel.caption} />
      )}
    </DashboardPanel>
  );
}

export default function AnalyticsPlaceholders({
  panels = ANALYTICS_PLACEHOLDERS,
}) {
  return (
    <section
      aria-labelledby="dashboard-analytics-heading"
      className="space-y-[var(--space-4)]"
    >
      <SectionHeader
        eyebrow="Insights"
        title="Analytics & Calendar"
        description="Chart and calendar widgets — ready for live data binding."
        titleId="dashboard-analytics-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-3">
        {panels.map((panel) => (
          <AnalyticsPanel key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}
