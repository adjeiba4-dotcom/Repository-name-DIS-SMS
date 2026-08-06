import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  Clock3,
  DoorOpen,
  FileText,
  Hash,
  School,
  User,
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
  buildTimetableTimeline,
  formatClassLabel,
  formatDayOfWeek,
  formatSubjectLabel,
  formatTeacherName,
  formatTimeRange,
  formatTimetableStatus,
} from "./timetable.mappers";

/**
 * Detailed timetable slot profile body.
 */
export default function TimetableDetails({ entry, className = "" }) {
  if (!entry) return null;

  const statusLabel = formatTimetableStatus(entry.status);
  const classLabel = formatClassLabel(entry.schoolClass);
  const subjectLabel = formatSubjectLabel(entry.subject);
  const teacherLabel = formatTeacherName(entry.teacher);
  const timeline = buildTimetableTimeline(entry);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={subjectLabel}
        subtitle={`${classLabel} · ${formatDayOfWeek(entry.dayOfWeek)} ${formatTimeRange(entry.startTime, entry.endTime)}`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Schedule details">
        <ProfileDetailItem
          icon={School}
          label="Class"
          value={classLabel}
        />
        <ProfileDetailItem
          icon={BookOpen}
          label="Subject"
          value={subjectLabel}
        />
        <ProfileDetailItem
          icon={User}
          label="Teacher"
          value={teacherLabel}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Academic year"
          value={entry.academicYear?.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={
            entry.term?.name
              ? `${entry.term.name}${
                  entry.term.code ? ` (${entry.term.code})` : ""
                }`
              : "—"
          }
        />
        <ProfileDetailItem
          icon={Clock3}
          label="Day & time"
          value={`${formatDayOfWeek(entry.dayOfWeek)} · ${formatTimeRange(entry.startTime, entry.endTime)}`}
        />
        <ProfileDetailItem
          icon={DoorOpen}
          label="Room"
          value={entry.room || "—"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(entry.id)}
        />
      </ProfileSection>

      {entry.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={entry.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Scope summary"
        items={[
          {
            key: "class",
            label: "Class",
            value: classLabel,
            icon: School,
          },
          {
            key: "year",
            label: "Academic year",
            value: entry.academicYear?.name || "—",
            icon: CalendarDays,
          },
          {
            key: "term",
            label: "Term",
            value: entry.term?.name || "—",
            icon: CalendarRange,
          },
          {
            key: "time",
            label: "Period",
            value: `${formatDayOfWeek(entry.dayOfWeek)} · ${formatTimeRange(entry.startTime, entry.endTime)}`,
            icon: Clock3,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
