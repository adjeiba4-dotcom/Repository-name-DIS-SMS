import {
  Archive,
  Briefcase,
  UserCheck,
  UserMinus,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getTeacherStats } from "./sampleTeachers";

export default function TeacherStats({ teachers = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getTeacherStats(teachers);

  return (
    <section aria-labelledby="teacher-stats-heading" className="space-y-[var(--space-3)]">
      <SectionHeader
        eyebrow="Staffing"
        title="Teacher Metrics"
        titleId="teacher-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Teachers"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={Briefcase}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently on staff"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Temporarily paused"
          trend="Review"
          tone="warning"
          icon={UserMinus}
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
