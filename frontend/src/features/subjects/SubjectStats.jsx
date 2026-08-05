import { Archive, BookOpen, UserCheck, UserX } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getSubjectStats } from "./subject.mappers";

export default function SubjectStats({ subjects = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getSubjectStats(subjects);

  return (
    <section
      aria-labelledby="subject-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Subject Metrics"
        titleId="subject-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Subjects"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={BookOpen}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently offered subjects"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Temporarily closed subjects"
          trend="Review"
          tone="warning"
          icon={UserX}
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
