import {
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
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
  ATTENDANCE_STATUS_MAP,
  buildAttendanceTimeline,
  formatAttendanceStatus,
  formatClassLabel,
  formatDisplayDate,
  formatStudentName,
} from "./attendance.mappers";

export default function AttendanceDetails({ record, className = "" }) {
  if (!record) return null;

  const statusLabel = formatAttendanceStatus(record.status);
  const studentLabel = formatStudentName(record.student || {});
  const classLabel = formatClassLabel(record.student?.schoolClass || {});
  const timeline = buildAttendanceTimeline(record);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={studentLabel}
        subtitle={`${formatDisplayDate(record.attendanceDate)} · ${statusLabel}`}
        status={statusLabel}
        statusLabel={statusLabel}
        statusVariant={ATTENDANCE_STATUS_MAP[statusLabel] || "secondary"}
      />

      <ProfileSection title="Attendance details">
        <ProfileDetailItem
          icon={User}
          label="Student"
          value={studentLabel}
        />
        <ProfileDetailItem
          icon={School}
          label="Class"
          value={classLabel}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Academic year"
          value={record.academicYear?.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={
            record.term?.name
              ? `${record.term.name}${
                  record.term.code ? ` (${record.term.code})` : ""
                }`
              : "—"
          }
        />
        <ProfileDetailItem
          icon={ClipboardCheck}
          label="Date & status"
          value={`${formatDisplayDate(record.attendanceDate)} · ${statusLabel}`}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(record.id)}
        />
      </ProfileSection>

      {record.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={record.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Scope summary"
        items={[
          {
            key: "student",
            label: "Student",
            value: studentLabel,
            icon: User,
          },
          {
            key: "class",
            label: "Class",
            value: classLabel,
            icon: School,
          },
          {
            key: "year",
            label: "Academic year",
            value: record.academicYear?.name || "—",
            icon: CalendarDays,
          },
          {
            key: "term",
            label: "Term",
            value: record.term?.name || "—",
            icon: CalendarRange,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
