import {
  Award,
  FileText,
  Lock,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getReportCardStatsFromRows } from "./reportCard.mappers";

export default function ReportCardStats({
  rows = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={5} />;
  }

  const local = getReportCardStatsFromRows(rows);
  const stats = overview
    ? {
        total: overview.reportCards ?? 0,
        average: overview.averageScore ?? 0,
        verified: overview.verified ?? 0,
        published: overview.published ?? 0,
        locked: overview.locked ?? 0,
      }
    : {
        total: local.total,
        average: local.average,
        verified: local.verified,
        published: local.published,
        locked: local.locked,
      };

  return (
    <section
      aria-labelledby="report-card-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Report Card Metrics"
        titleId="report-card-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Report Cards"
          value={String(stats.total)}
          hint="In current workspace scope"
          trend="Live"
          tone="brand"
          icon={FileText}
        />
        <StatCard
          label="Avg Score"
          value={String(stats.average ?? 0)}
          hint="Class / term average from snapshots"
          trend="Composite"
          tone="info"
          icon={Award}
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
          hint="Released to stakeholders"
          trend="Release"
          tone="success"
          icon={Megaphone}
        />
        <StatCard
          label="Locked"
          value={String(stats.locked)}
          hint="Immutable official records"
          trend="Secure"
          tone="warning"
          icon={Lock}
        />
      </div>
    </section>
  );
}
