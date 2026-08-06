import {
  BookOpen,
  ClipboardList,
  FileCheck2,
  School,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getExaminationStatsFromRows } from "./examination.mappers";

export default function ExaminationStats({
  rows = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const local = getExaminationStatsFromRows(rows);
  const stats = overview
    ? {
        total: overview.examinations ?? 0,
        scores: overview.scores ?? 0,
        types: overview.byType?.length ?? 0,
        average: overview.averageMarks ?? 0,
      }
    : {
        total: local.total,
        scores: local.scores,
        types: local.types,
        average: local.classes,
      };

  return (
    <section
      aria-labelledby="examination-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Examination Metrics"
        titleId="examination-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Examinations"
          value={String(stats.total)}
          hint="In current workspace scope"
          trend="Live"
          tone="brand"
          icon={FileCheck2}
        />
        <StatCard
          label="Scores Entered"
          value={String(stats.scores)}
          hint="Student marks recorded"
          trend="Progress"
          tone="success"
          icon={ClipboardList}
        />
        <StatCard
          label={overview ? "Avg Marks" : "Types"}
          value={String(overview ? stats.average : stats.types)}
          hint={overview ? "Average across recorded scores" : "Distinct examination types"}
          trend="Coverage"
          tone="info"
          icon={overview ? BookOpen : School}
        />
        <StatCard
          label={overview ? "Types Used" : "Classes"}
          value={String(overview ? stats.types : local.classes)}
          hint={overview ? "Examination types in scope" : "Classes with examinations"}
          trend="Scope"
          tone="warning"
          icon={overview ? School : BookOpen}
        />
      </div>
    </section>
  );
}
