import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  FileText,
  Hash,
  Layers,
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
  buildClassSubjectTimeline,
  formatAllocationStatus,
  formatTeacherName,
  formatTeacherSubjectLabel,
} from "./classSubject.mappers";

/**
 * Detailed class-subject allocation profile body.
 */
export default function ClassSubjectDetails({ allocation, className = "" }) {
  if (!allocation) return null;

  const statusLabel = formatAllocationStatus(allocation.status);
  const schoolClass = allocation.schoolClass || {};
  const subject = allocation.subject || {};
  const academicYear = allocation.academicYear || {};
  const term = allocation.term || {};
  const teacherSubject = allocation.teacherSubject || {};
  const teacher = teacherSubject.teacher || {};
  const timeline = buildClassSubjectTimeline(allocation);

  const classLabel = schoolClass.className
    ? `${schoolClass.className}${
        schoolClass.classCode ? ` (${schoolClass.classCode})` : ""
      }`
    : "—";
  const subjectLabel = subject.subjectName
    ? `${subject.subjectName}${
        subject.subjectCode ? ` (${subject.subjectCode})` : ""
      }`
    : "—";
  const teacherLabel = formatTeacherName(teacher);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={classLabel}
        subtitle={subjectLabel}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Allocation details">
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
          icon={Layers}
          label="Teacher subject assignment"
          value={formatTeacherSubjectLabel(teacherSubject)}
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
          icon={Hash}
          label="Weekly periods"
          value={String(allocation.weeklyPeriods ?? "—")}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Compulsory"
          value={allocation.isCompulsory ? "Yes" : "No"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Display order"
          value={String(allocation.displayOrder ?? 0)}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(allocation.id)}
        />
      </ProfileSection>

      {allocation.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={allocation.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Scope summary"
        items={[
          {
            key: "class",
            label: "Class",
            value: schoolClass.className || "—",
            icon: School,
          },
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
            value: String(allocation.weeklyPeriods ?? 0),
            icon: Hash,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
