import {
  Award,
  FileText,
  Lock,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

import { SelectField } from "../../components/form";
import { Panel, SectionHeader, StatCard } from "../../components/dashboard";
import { DataTable } from "../../components/data-table";
import { Skeleton, StatCardsSkeleton } from "../../components/ui/Skeleton";
import { Caption } from "../../components/ui/Typography";
import {
  SUMMARY_SCOPE_OPTIONS,
  formatClassLabel,
  formatScore,
} from "./reportCard.mappers";

function OverviewCards({ overview = {} }) {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Report Cards"
        value={String(overview.reportCards ?? 0)}
        hint="Snapshots in scope"
        trend="Live"
        tone="brand"
        icon={FileText}
      />
      <StatCard
        label="Verified"
        value={String(overview.verified ?? 0)}
        hint={`${overview.published ?? 0} published`}
        trend="Workflow"
        tone="success"
        icon={ShieldCheck}
      />
      <StatCard
        label="Avg Score"
        value={formatScore(overview.averageScore)}
        hint={
          overview.averageAttendance == null
            ? "Attendance —"
            : `Attendance ${formatScore(overview.averageAttendance)}%`
        }
        trend="Academic"
        tone="info"
        icon={Award}
      />
      <StatCard
        label="Locked"
        value={String(overview.locked ?? 0)}
        hint={`${overview.promoted ?? 0} promoted`}
        trend="Workflow"
        tone="warning"
        icon={Lock}
      />
    </div>
  );
}

export default function ReportCardSummaries({
  scope = "overview",
  onScopeChange,
  stats = null,
  loading = false,
}) {
  const classes = (stats?.classes || []).map((row) => ({
    id: row.classId,
    classLabel: formatClassLabel(row.schoolClass),
    count: row.count,
    averageScore: formatScore(row.averageScore),
  }));

  const columns = [
    { key: "classLabel", label: "Class", sortable: true },
    { key: "count", label: "Cards", sortable: true },
    { key: "averageScore", label: "Avg Score", sortable: true },
  ];

  return (
    <section className="space-y-[var(--space-4)]">
      <SectionHeader
        eyebrow="Insights"
        title="Report Card Analytics"
        description="Overview and class breakdown for generated academic snapshots."
        titleId="report-card-analytics-heading"
      />

      {typeof onScopeChange === "function" ? (
        <Panel
          title="Analytics Controls"
          description="Choose a summary scope for the current academic filters."
        >
          <SelectField
            label="Summary scope"
            name="reportCardSummaryScope"
            value={scope}
            onChange={(event) => onScopeChange(event.target.value)}
            options={SUMMARY_SCOPE_OPTIONS}
            className="min-w-[12rem]"
          />
        </Panel>
      ) : null}

      <Panel
        title="Overview"
        description="Totals for the selected filters and workflow stages."
      >
        {loading ? (
          <StatCardsSkeleton count={4} />
        ) : stats ? (
          <OverviewCards overview={stats.overview || {}} />
        ) : (
          <Caption variant="muted">
            No analytics available for the selected filters.
          </Caption>
        )}
      </Panel>

      {scope === "class" ? (
        <Panel
          title="Class Breakdown"
          description="Report card counts and averages by class."
        >
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <DataTable
              columns={columns}
              rows={classes}
              emptyTitle="No class analytics"
              emptyDescription="Generate report cards for this scope to see class breakdowns."
              emptyIcon={Megaphone}
            />
          )}
        </Panel>
      ) : null}
    </section>
  );
}
