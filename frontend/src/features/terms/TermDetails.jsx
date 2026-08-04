import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Hash,
  Layers,
} from "lucide-react";

import {
  InformationCard,
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
  TimelineCard,
} from "../../components/profile";
import { cn } from "../../utils/cn";
import {
  buildTermTimeline,
  formatDisplayDate,
  formatTermStatus,
} from "./term.mappers";

/**
 * Detailed term profile body.
 */
export default function TermDetails({ term, className = "" }) {
  if (!term) return null;

  const statusLabel = formatTermStatus(term.status);
  const counts = term._count || {};
  const academicYear = term.academicYear || {};
  const timeline = buildTermTimeline(term);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={term.name}
        subtitle={
          term.isCurrent
            ? `${term.code} · Current term`
            : `${term.code} · Academic term`
        }
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Schedule">
        <ProfileDetailItem
          icon={Layers}
          label="Academic year"
          value={academicYear.name || "—"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Code"
          value={term.code || "—"}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Start date"
          value={formatDisplayDate(term.startDate)}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="End date"
          value={formatDisplayDate(term.endDate)}
        />
        <ProfileDetailItem
          icon={CheckCircle2}
          label="Current term"
          value={term.isCurrent ? "Yes" : "No"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(term.id)}
        />
      </ProfileSection>

      {term.description ? (
        <ProfileSection title="Description">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={term.description}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Usage summary"
        items={[
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
            key: "results",
            label: "Results",
            value: String(counts.results ?? 0),
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

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
