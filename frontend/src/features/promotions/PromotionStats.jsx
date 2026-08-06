import {
  Award,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  PlayCircle,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getPromotionStatsFromRows } from "./promotion.mappers";

export default function PromotionStats({
  rows = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={5} />;
  }

  const local = getPromotionStatsFromRows(rows);
  const stats = overview
    ? {
        total: overview.promotions ?? 0,
        draft: overview.draft ?? 0,
        approved: overview.approved ?? 0,
        executed: overview.executed ?? 0,
        graduated: overview.graduated ?? 0,
      }
    : local;

  return (
    <section
      aria-labelledby="promotion-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Promotion Metrics"
        titleId="promotion-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Promotions"
          value={String(stats.total)}
          hint="In current workspace scope"
          trend="Live"
          tone="brand"
          icon={FileCheck2}
        />
        <StatCard
          label="Draft / Preview"
          value={String(stats.draft)}
          hint="Awaiting approval"
          trend="Workflow"
          tone="info"
          icon={Award}
        />
        <StatCard
          label="Approved"
          value={String(stats.approved)}
          hint="Ready to execute"
          trend="Ready"
          tone="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Executed"
          value={String(stats.executed)}
          hint="Enrolled or exited"
          trend="Complete"
          tone="success"
          icon={PlayCircle}
        />
        <StatCard
          label="Graduated"
          value={String(stats.graduated)}
          hint="Exit decisions"
          trend="Alumni"
          tone="warning"
          icon={GraduationCap}
        />
      </div>
    </section>
  );
}
