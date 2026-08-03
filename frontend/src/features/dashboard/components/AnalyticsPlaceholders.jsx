import { BarChart3 } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  SectionHeader,
} from "../../../components/dashboard";
import { ANALYTICS_PLACEHOLDERS } from "../data/placeholders";

function AnalyticsPanel({ panel }) {
  return (
    <DashboardPanel
      title={panel.title}
      description={panel.description}
      actions={
        <div
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
          aria-hidden
        >
          <BarChart3 size={18} />
        </div>
      }
    >
      <EmptyState
        className="h-48 py-0"
        role="img"
        aria-label={`${panel.title} chart placeholder`}
        description={panel.caption}
      >
        <div
          className="mx-auto mb-[var(--space-3)] flex h-16 w-40 items-end justify-center gap-[var(--space-1)]"
          aria-hidden
        >
          {[40, 65, 48, 80, 55, 72, 44].map((h, i) => (
            <span
              key={i}
              className="w-3 rounded-t-[var(--radius-sm)] bg-[var(--color-brand-200)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </EmptyState>
    </DashboardPanel>
  );
}

export default function AnalyticsPlaceholders({
  panels = ANALYTICS_PLACEHOLDERS,
}) {
  return (
    <section
      aria-labelledby="dashboard-analytics-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Insights"
        title="Analytics"
        titleId="dashboard-analytics-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {panels.map((panel) => (
          <AnalyticsPanel key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}
