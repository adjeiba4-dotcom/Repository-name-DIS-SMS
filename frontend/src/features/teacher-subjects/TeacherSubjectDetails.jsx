import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  FileText,
  Hash,
  Star,
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
  buildTeacherSubjectTimeline,
  formatAssignmentStatus,
  formatTeacherName,
} from "./teacherSubject.mappers";

/**
 * Detailed teacher-subject assignment profile body.
 */
export default function TeacherSubjectDetails({ assignment, className = "" }) {
  if (!assignment) return null;

  const statusLabel = formatAssignmentStatus(assignment.status);
  const teacher = assignment.teacher || {};
  const subject = assignment.subject || {};
  const academicYear = assignment.academicYear || {};
  const term = assignment.term || {};
  const timeline = buildTeacherSubjectTimeline(assignment);
  const teacherLabel = formatTeacherName(teacher);
  const subjectLabel = subject.subjectName
    ? `${subject.subjectName}${
        subject.subjectCode ? ` (${subject.subjectCode})` : ""
      }`
    : "—";

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={teacherLabel}
        subtitle={subjectLabel}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Assignment details">
        <ProfileDetailItem
          icon={User}
          label="Teacher"
          value={teacherLabel}
        />
        <ProfileDetailItem
          icon={BookOpen}
          label="Subject"
          value={subjectLabel}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Academic year"
          value={academicYear.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={
            term.name
              ? `${term.name}${term.code ? ` (${term.code})` : ""}`
              : "All terms"
          }
        />
        <ProfileDetailItem
          icon={Star}
          label="Primary teacher"
          value={assignment.isPrimary ? "Yes" : "No"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Weekly periods"
          value={String(assignment.weeklyPeriods ?? "—")}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(assignment.id)}
        />
      </ProfileSection>

      {assignment.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={assignment.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Scope summary"
        items={[
          {
            key: "year",
            label: "Academic year",
            value: academicYear.name || "—",
            icon: CalendarDays,
          },
          {
            key: "term",
            label: "Term",
            value: term.name || "All terms",
            icon: CalendarRange,
          },
          {
            key: "periods",
            label: "Weekly periods",
            value: String(assignment.weeklyPeriods ?? 0),
            icon: Hash,
          },
          {
            key: "primary",
            label: "Role",
            value: assignment.isPrimary ? "Primary" : "Secondary",
            icon: Star,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
