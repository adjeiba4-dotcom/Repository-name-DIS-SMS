import { Archive, CalendarCheck, CalendarDays, CalendarX } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getAcademicYearStats } from "./academicYear.mappers";

export default function AcademicYearStats({ years = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getAcademicYearStats(years);

  return (
    <section
      aria-labelledby="academic-year-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Academic Year Metrics"
        titleId="academic-year-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Years"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={CalendarDays}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Current operational year"
          trend="On roll"
          tone="success"
          icon={CalendarCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Planned or closed years"
          trend="Review"
          tone="warning"
          icon={CalendarX}
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
