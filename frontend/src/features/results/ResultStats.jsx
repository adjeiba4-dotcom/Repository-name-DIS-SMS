import {
  Award,
  BarChart3,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getResultStatsFromRows } from "./result.mappers";

export default function ResultStats({
  rows = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={5} />;
  }

  const local = getResultStatsFromRows(rows);
  const stats = overview
    ? {
        total: overview.results ?? 0,
        average: overview.averageFinalScore ?? 0,
        passRate: overview.passRate ?? 0,
        verified: overview.verified ?? 0,
        published: overview.published ?? 0,
      }
    : {
        total: local.total,
        average: local.average,
        passRate: local.total
          ? Math.round((local.passed / local.total) * 1000) / 10
          : 0,
        verified: local.verified,
        published: local.published,
      };

  return (
    <section
      aria-labelledby="result-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Results Metrics"
        titleId="result-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Results"
          value={String(stats.total)}
          hint="In current workspace scope"
          trend="Live"
          tone="brand"
          icon={BarChart3}
        />
        <StatCard
          label="Avg Final"
          value={String(stats.average)}
          hint="Weighted CA + examination score"
          trend="Composite"
          tone="info"
          icon={Award}
        />
        <StatCard
          label="Pass Rate"
          value={`${stats.passRate}%`}
          hint="Students at or above pass mark"
          trend="Outcome"
          tone="success"
          icon={ShieldCheck}
        />
        <StatCard
          label="Verified"
          value={String(stats.verified)}
          hint="Academic verification complete"
          trend="Workflow"
          tone="success"
          icon={ShieldCheck}
        />
        <StatCard
          label="Published"
          value={String(stats.published)}
          hint="Released result records"
          trend="Release"
          tone="warning"
          icon={Lock}
        />
      </div>
    </section>
  );
}
