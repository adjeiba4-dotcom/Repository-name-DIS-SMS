import { Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import { Skeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import {
  SUMMARY_SCOPE_OPTIONS,
  formatAssessmentType,
} from "./assessment.mappers";

export default function AssessmentSummaries({
  scope = "overview",
  onScopeChange,
  stats = null,
  loading = false,
}) {
  const breakdown = stats?.breakdown ?? [];
  const overview = stats?.overview ?? null;

  return (
    <section className="space-y-[var(--space-4)]">
      <SectionHeader
        eyebrow="Insights"
        title="Assessment Analytics"
        description="Overview and breakdowns by class, subject, teacher, type, and student."
      />

      <Panel
        title="Analytics Controls"
        description="Choose a summary scope for the current academic filters."
      >
        <SelectField
          label="Summary scope"
          name="assessmentSummaryScope"
          value={scope}
          onChange={(event) => onScopeChange?.(event.target.value)}
          options={SUMMARY_SCOPE_OPTIONS}
        />
      </Panel>

      <Panel title="Overview" description="Totals for the selected scope.">
        {loading ? (
          <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-20 rounded-[var(--radius-md)]"
              />
            ))}
          </div>
        ) : overview ? (
          <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
            {[
              ["Assessments", overview.assessments],
              ["Scores", overview.scores],
              ["Average marks", overview.averageMarks],
              ["Types", overview.byType?.length ?? 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-muted)] p-[var(--space-3)]"
              >
                <Caption variant="muted" size="sm" className="m-0">
                  {label}
                </Caption>
                <Body
                  size="lg"
                  className="m-0 font-[number:var(--font-weight-semibold)]"
                >
                  {value}
                </Body>
              </div>
            ))}
          </div>
        ) : (
          <Body variant="muted" size="sm" className="m-0">
            Select filters to load analytics.
          </Body>
        )}
      </Panel>

      <Panel
        title="Breakdown"
        description="Grouped assessment and score metrics."
      >
        {loading ? (
          <div className="space-y-[var(--space-2)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-12 w-full rounded-[var(--radius-md)]"
              />
            ))}
          </div>
        ) : breakdown.length === 0 ? (
          <Body variant="muted" size="sm" className="m-0">
            No assessment data for this summary window.
          </Body>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-muted)] text-left">
                  {["Group", "Assessments", "Scores", "Avg Marks"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-[var(--space-3)] py-[var(--space-2)]"
                      >
                        <Caption variant="muted" size="sm" className="m-0">
                          {heading}
                        </Caption>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-[var(--color-border-muted)] last:border-b-0"
                  >
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <Body size="sm" className="m-0">
                        {scope === "type" || scope === "overview"
                          ? formatAssessmentType(row.label)
                          : row.label}
                      </Body>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.assessments}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.scores}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.averageMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </section>
  );
}
