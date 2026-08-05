import { Archive, BookUser, Star, UserCheck } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getTeacherSubjectStats } from "./teacherSubject.mappers";

export default function TeacherSubjectStats({
  assignments = [],
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getTeacherSubjectStats(assignments);

  return (
    <section
      aria-labelledby="teacher-subject-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Assignment Metrics"
        titleId="teacher-subject-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Assignments"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={BookUser}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently teaching assignments"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Primary"
          value={String(stats.primary)}
          hint="Primary subject teachers"
          trend="Lead"
          tone="info"
          icon={Star}
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
