import {
  Archive,
  UserCheck,
  UserMinus,
  UserRound,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getGuardianStats } from "./sampleGuardians";

export default function GuardianStats({ guardians = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getGuardianStats(guardians);

  return (
    <section
      aria-labelledby="guardian-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Family"
        title="Guardian Metrics"
        titleId="guardian-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Guardians"
          value={String(stats.total)}
          hint="All records in workspace"
          trend="Live"
          tone="brand"
          icon={UserRound}
        />
        <StatCard
          label="Active"
          value={String(stats.active)}
          hint="Currently linked or available"
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
