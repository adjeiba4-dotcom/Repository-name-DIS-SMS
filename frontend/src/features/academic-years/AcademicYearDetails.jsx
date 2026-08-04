import { CalendarDays, CheckCircle2, Hash, Layers } from "lucide-react";

import {
  InformationCard,
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
  StatusBadge,
  TimelineCard,
} from "../../components/profile";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  buildAcademicYearTimeline,
  formatAcademicYearStatus,
  formatDisplayDate,
} from "./academicYear.mappers";

/**
 * Detailed academic year profile body.
 */
export default function AcademicYearDetails({ academicYear, className = "" }) {
  if (!academicYear) return null;

  const statusLabel = formatAcademicYearStatus(academicYear.status);
  const counts = academicYear._count || {};
  const terms = academicYear.terms || [];
  const timeline = buildAcademicYearTimeline(academicYear);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={academicYear.name}
        subtitle={
          academicYear.isCurrent
            ? "Current academic year"
            : "Academic year record"
        }
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Schedule">
        <ProfileDetailItem
          icon={CalendarDays}
          label="Start date"
          value={formatDisplayDate(academicYear.startDate)}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="End date"
          value={formatDisplayDate(academicYear.endDate)}
        />
        <ProfileDetailItem
          icon={CheckCircle2}
          label="Current year"
          value={academicYear.isCurrent ? "Yes" : "No"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(academicYear.id)}
        />
      </ProfileSection>

      <InformationCard
        title="Usage summary"
        items={[
          {
            key: "terms",
            label: "Terms",
            value: String(counts.terms ?? terms.length),
            icon: Layers,
          },
          {
            key: "enrollments",
            label: "Enrollments",
            value: String(counts.enrollments ?? 0),
            icon: Hash,
          },
          {
            key: "attendance",
            label: "Attendance rows",
            value: String(counts.attendance ?? 0),
            icon: CalendarDays,
          },
          {
            key: "examinations",
            label: "Examinations",
            value: String(counts.examinations ?? 0),
            icon: Hash,
          },
          {
            key: "feeStructures",
            label: "Fee structures",
            value: String(counts.feeStructures ?? 0),
            icon: Hash,
          },
          {
            key: "timetables",
            label: "Timetables",
            value: String(counts.timetables ?? 0),
            icon: CalendarDays,
          },
        ]}
      />

      <section className="space-y-[var(--space-3)]">
        <div>
          <Body
            variant="default"
            size="sm"
            className="m-0 font-[number:var(--font-weight-semibold)]"
          >
            Terms
          </Body>
          <Caption variant="muted" size="sm" className="m-0">
            Terms linked to this academic year.
          </Caption>
        </div>

        {terms.length === 0 ? (
          <Caption variant="muted" size="sm" className="m-0">
            No terms linked yet.
          </Caption>
        ) : (
          <ul className="space-y-[var(--space-2)]">
            {terms.map((term) => (
              <li
                key={term.id}
                className="flex flex-wrap items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-muted)] px-[var(--space-3)] py-[var(--space-2)]"
              >
                <div className="min-w-0">
                  <Body
                    variant="default"
                    size="sm"
                    className="m-0 font-[number:var(--font-weight-semibold)]"
                  >
                    {term.name}
                  </Body>
                  <Caption variant="muted" size="sm" className="m-0">
                    {formatDisplayDate(term.startDate)} –{" "}
                    {formatDisplayDate(term.endDate)}
                  </Caption>
                </div>
                <StatusBadge
                  status={formatAcademicYearStatus(term.status)}
                  label={formatAcademicYearStatus(term.status)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
