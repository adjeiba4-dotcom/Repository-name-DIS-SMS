import { Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import { StatusBadge } from "../../components/profile";
import { Skeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import {
  ATTENDANCE_STATUS_MAP,
  SUMMARY_SCOPE_OPTIONS,
} from "./attendance.mappers";

export default function AttendanceSummaries({
  scope = "daily",
  onScopeChange,
  stats = null,
  loading = false,
  teacherOptions = [],
  studentOptions = [],
  teacherId = "",
  studentId = "",
  onTeacherChange,
  onStudentChange,
}) {
  const breakdown = stats?.breakdown ?? [];
  const overview = stats?.overview ?? null;

  return (
    <section className="space-y-[var(--space-4)]">
      <SectionHeader
        eyebrow="Insights"
        title="Attendance Summaries"
        description="Daily, weekly, monthly, class, teacher, and student roll-up views."
      />

      <Panel
        title="Summary Controls"
        description="Choose a summary scope and optional entity filters."
      >
        <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-3">
          <SelectField
            label="Summary scope"
            name="summaryScope"
            value={scope}
            onChange={(event) => onScopeChange?.(event.target.value)}
            options={SUMMARY_SCOPE_OPTIONS}
          />
          {scope === "teacher" ? (
            <SelectField
              label="Teacher"
              name="summaryTeacherId"
              value={teacherId}
              onChange={(event) => onTeacherChange?.(event.target.value)}
              options={[
                { value: "", label: "Select teacher" },
                ...teacherOptions,
              ]}
            />
          ) : null}
          {scope === "student" ? (
            <SelectField
              label="Student"
              name="summaryStudentId"
              value={studentId}
              onChange={(event) => onStudentChange?.(event.target.value)}
              options={[
                { value: "", label: "Select student" },
                ...studentOptions,
              ]}
            />
          ) : null}
        </div>
      </Panel>

      <Panel title="Overview" description="Totals for the selected summary window.">
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
          <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-5">
            {[
              ["Present", overview.PRESENT, "Present"],
              ["Absent", overview.ABSENT, "Absent"],
              ["Late", overview.LATE, "Late"],
              ["Excused", overview.EXCUSED, "Excused"],
              ["Rate", `${overview.presentRate}%`, null],
            ].map(([label, value, status]) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-muted)] p-[var(--space-3)]"
              >
                <Caption variant="muted" size="sm" className="m-0">
                  {label}
                </Caption>
                <Body
                  variant="default"
                  size="lg"
                  className="m-0 font-[number:var(--font-weight-semibold)]"
                >
                  {value}
                </Body>
                {status ? (
                  <div className="mt-[var(--space-2)]">
                    <StatusBadge
                      status={status}
                      label={status}
                      statusMap={ATTENDANCE_STATUS_MAP}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <Body variant="muted" size="sm" className="m-0">
            Select filters to load a summary.
          </Body>
        )}
      </Panel>

      <Panel
        title="Breakdown"
        description="Grouped attendance counts for the selected scope."
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
            No attendance data for this summary window.
          </Body>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-muted)] text-left">
                  {["Group", "Present", "Absent", "Late", "Excused", "Rate"].map(
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
                        {row.label}
                      </Body>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.PRESENT}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.ABSENT}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.LATE}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.EXCUSED}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {row.presentRate}%
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
