import { Archive, ClipboardList, UserCheck, UserX } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getEnrollmentStats } from "./enrollment.mappers";

export default function EnrollmentStats({
  enrollments = [],
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getEnrollmentStats(enrollments);

  return (
    <section
      aria-labelledby="enrollment-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Enrollment Metrics"
        titleId="enrollment-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Enrollments"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={ClipboardList}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently enrolled students"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Paused placements"
          trend="Hold"
          tone="info"
          icon={UserX}
        />
        <StatCard
          label="Archived"
          value={String(stats.archived)}
          hint="Soft-deleted records"
          trend="Archive"
          tone="warning"
          icon={Archive}
        />
      </div>
    </section>
  );
}
