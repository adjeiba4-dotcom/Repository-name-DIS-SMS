import { CalendarCheck, CalendarDays, CalendarRange, Archive } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getTermStats } from "./term.mappers";

export default function TermStats({ terms = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getTermStats(terms);

  return (
    <section
      aria-labelledby="term-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Term Metrics"
        titleId="term-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Terms"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={CalendarRange}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Current operational term"
          trend="On roll"
          tone="success"
          icon={CalendarCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Planned or closed terms"
          trend="Review"
          tone="warning"
          icon={CalendarDays}
        />
        <StatCard
          label="Archived"
          value={String(stats.archived)}
          hint="Soft-deleted records"
          trend="Archive"
          tone="info"
          icon={Archive}
        />
      </div>
    </section>
  );
}
