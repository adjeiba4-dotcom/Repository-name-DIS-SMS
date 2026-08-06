import { SelectField } from "../../components/form";
import { Panel, SectionHeader, StatCard } from "../../components/dashboard";
import { DataTable } from "../../components/data-table";
import { Skeleton, StatCardsSkeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import {
  Award,
  BarChart3,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { SUMMARY_SCOPE_OPTIONS } from "./result.mappers";

function OverviewCards({ overview = {} }) {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Results"
        value={String(overview.results ?? 0)}
        hint="Composite records in scope"
        trend="Live"
        tone="brand"
        icon={BarChart3}
      />
      <StatCard
        label="Pass Rate"
        value={
          overview.passRate != null ? `${overview.passRate}%` : "—"
        }
        hint={`${overview.passed ?? 0} passed · ${overview.failed ?? 0} failed`}
        trend="Outcome"
        tone="success"
        icon={ShieldCheck}
      />
      <StatCard
        label="Avg Final"
        value={String(overview.averageFinalScore ?? "—")}
        hint={`CA ${overview.averageCaScore ?? "—"} · Exam ${overview.averageExamScore ?? "—"}`}
        trend="Composite"
        tone="info"
        icon={Award}
      />
      <StatCard
        label="Published"
        value={String(overview.published ?? 0)}
        hint="Released to stakeholders"
        trend="Workflow"
        tone="warning"
        icon={Lock}
      />
      <StatCard
        label="Locked"
        value={String(overview.locked ?? 0)}
        hint="Immutable final records"
        trend="Workflow"
        tone="warning"
        icon={Lock}
      />
    </div>
  );
}

function groupRows(stats, scope) {
  if (scope === "class") return stats?.byClass || [];
  if (scope === "subject") return stats?.bySubject || [];
  if (scope === "student") return stats?.byStudent || [];
  if (scope === "grade") return stats?.byGrade || [];
  return [];
}

export default function ResultSummaries({
  scope = "overview",
  onScopeChange,
  stats = null,
  loading = false,
}) {
  const rows = groupRows(stats, scope).map((row) => ({
    id: row.key,
    label: row.label,
    results: row.results,
    passed: row.passed,
    failed: row.failed,
    averageFinalScore: row.averageFinalScore,
    passRate: `${row.passRate}%`,
  }));

  const columns = [
    { key: "label", label: "Group", sortable: true },
    { key: "results", label: "Results", sortable: true },
    { key: "passed", label: "Passed", sortable: true },
    { key: "failed", label: "Failed", sortable: true },
    { key: "averageFinalScore", label: "Avg Final", sortable: true },
    { key: "passRate", label: "Pass Rate", sortable: true },
  ];

  return (
    <section className="space-y-[var(--space-4)]">
      <SectionHeader
        eyebrow="Insights"
        title="Results Analytics"
        description="Breakdown of composite results by class, subject, student, or grade band."
      />

      <Panel
        title="Analytics Controls"
        description="Choose a summary scope for the current academic filters."
      >
        <SelectField
          label="Summary scope"
          name="resultSummaryScope"
          value={scope}
          onChange={(event) => onScopeChange?.(event.target.value)}
          options={SUMMARY_SCOPE_OPTIONS}
          className="min-w-[12rem]"
        />
      </Panel>

      <Panel
        title="Overview"
        description="Totals for the selected filters and workflow stages."
      >
        {loading ? (
          <StatCardsSkeleton count={5} />
        ) : (
          <OverviewCards overview={stats?.overview || {}} />
        )}
      </Panel>

      {scope !== "overview" ? (
        <Panel
          title="Breakdown"
          description="Grouped metrics for the selected analytics scope."
        >
          {loading ? (
            <div className="space-y-[var(--space-2)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 rounded-[var(--radius-md)]"
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              emptyTitle="No analytics for this scope"
              emptyDescription="Generate results for the selected filters to populate analytics."
            />
          )}
        </Panel>
      ) : !loading && !stats?.overview ? (
        <Body variant="muted" size="sm" className="m-0">
          Select filters to load analytics.
        </Body>
      ) : (
        <Caption variant="muted" className="m-0">
          Switch scope above for class, subject, student, or grade breakdowns.
        </Caption>
      )}
    </section>
  );
}
