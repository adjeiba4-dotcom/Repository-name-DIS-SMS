import {
  BookOpen,
  ClipboardList,
  FileCheck2,
  School,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getAssessmentStatsFromRows } from "./assessment.mappers";

export default function AssessmentStats({
  rows = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const local = getAssessmentStatsFromRows(rows);
  const stats = overview
    ? {
        total: overview.assessments ?? 0,
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
      aria-labelledby="assessment-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Assessment Metrics"
        titleId="assessment-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assessments"
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
          hint={overview ? "Average across recorded scores" : "Distinct assessment types"}
          trend="Coverage"
          tone="info"
          icon={overview ? BookOpen : School}
        />
        <StatCard
          label={overview ? "Types Used" : "Classes"}
          value={String(overview ? stats.types : local.classes)}
          hint={overview ? "Assessment types in scope" : "Classes with assessments"}
          trend="Scope"
          tone="warning"
          icon={overview ? School : BookOpen}
        />
      </div>
    </section>
  );
}
