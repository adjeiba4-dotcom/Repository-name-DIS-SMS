import {
  GraduationCap,
  UserCheck,
  UserMinus,
  Archive,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getStudentStats } from "./sampleStudents";

export default function StudentStats({ students = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getStudentStats(students);

  return (
    <section aria-labelledby="student-stats-heading" className="space-y-[var(--space-3)]">
      <SectionHeader
        eyebrow="Enrollment"
        title="Student Metrics"
        titleId="student-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={GraduationCap}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently enrolled"
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
