import { Archive, Building2, UserCheck, UserX } from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getDepartmentStats } from "./department.mappers";

export default function DepartmentStats({
  departments = [],
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getDepartmentStats(departments);

  return (
    <section
      aria-labelledby="department-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Organization"
        title="Department Metrics"
        titleId="department-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Departments"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={Building2}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently operational"
          trend="On roll"
          tone="success"
          icon={UserCheck}
        />
        <StatCard
          label="Inactive"
          value={String(stats.inactive)}
          hint="Temporarily closed"
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
