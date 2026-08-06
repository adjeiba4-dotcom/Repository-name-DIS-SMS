import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import { Body, Caption } from "../../components/ui/Typography";
import { SUMMARY_SCOPE_OPTIONS } from "./promotion.mappers";

export default function PromotionSummaries({
  scope = "overview",
  onScopeChange,
  overview = null,
  byClass = [],
  loading = false,
}) {
  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          eyebrow="Analytics"
          title="Promotion Summaries"
          description="Decision mix and class-level breakdown for the selected year."
        />
        <div className="w-full max-w-xs">
          <SelectField
            label="Scope"
            value={scope}
            onChange={(event) => onScopeChange?.(event.target.value)}
            options={SUMMARY_SCOPE_OPTIONS}
          />
        </div>
      </div>

      {loading ? (
        <Panel>
          <Body variant="muted">Loading summaries…</Body>
        </Panel>
      ) : scope === "class" ? (
        byClass.length ? (
          <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2 xl:grid-cols-3">
            {byClass.map((item) => (
              <Panel key={item.classId} className="space-y-2">
                <Body className="m-0 font-[number:var(--font-weight-semibold)]">
                  {item.className || "Class"}{" "}
                  {item.classCode ? `(${item.classCode})` : ""}
                </Body>
                <Caption variant="muted" className="m-0">
                  Total {item.total} · Promoted {item.promoted} · Probation{" "}
                  {item.promotedOnProbation} · Repeat {item.repeat} · Graduated{" "}
                  {item.graduated}
                </Caption>
                <Caption variant="muted" className="m-0">
                  Draft {item.draft} · Approved {item.approved} · Executed{" "}
                  {item.executed}
                </Caption>
              </Panel>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No class breakdown"
            description="Generate recommendations for this academic year to see class analytics."
          />
        )
      ) : overview ? (
        <Panel className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            ["Promoted", overview.promoted],
            ["On Probation", overview.promotedOnProbation],
            ["Repeat", overview.repeat],
            ["Graduated", overview.graduated],
            ["Withdrawn", overview.withdrawn],
            ["Transferred", overview.transferred],
            ["Draft", overview.draft],
            ["Approved", overview.approved],
            ["Executed", overview.executed],
            ["Cancelled", overview.cancelled],
            ["Avg Score", overview.averageScore ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <Caption variant="muted" className="m-0">
                {label}
              </Caption>
              <Body className="m-0 font-[number:var(--font-weight-semibold)]">
                {value ?? 0}
              </Body>
            </div>
          ))}
        </Panel>
      ) : (
        <EmptyState
          title="No overview data"
          description="Select an academic year with promotion records."
        />
      )}
    </div>
  );
}
