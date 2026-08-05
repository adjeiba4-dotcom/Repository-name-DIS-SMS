import { Archive, BookMarked, BookCheck, UserCheck } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getClassSubjectStats } from "./classSubject.mappers";

export default function ClassSubjectStats({
  allocations = [],
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getClassSubjectStats(allocations);

  return (
    <section
      aria-labelledby="class-subject-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Allocation Metrics"
        titleId="class-subject-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Allocations"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={BookMarked}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently allocated subjects"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Compulsory"
          value={String(stats.compulsory)}
          hint="Required class subjects"
          trend="Core"
          tone="info"
          icon={BookCheck}
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
