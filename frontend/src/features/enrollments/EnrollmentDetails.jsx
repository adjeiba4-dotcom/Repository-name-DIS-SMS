import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileText,
  Hash,
  School,
  User,
  Users,
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
  buildEnrollmentTimeline,
  formatClassLabel,
  formatDisplayDate,
  formatEnrollmentStatus,
  formatGuardianName,
  formatStudentLabel,
  formatTeacherName,
} from "./enrollment.mappers";

/**
 * Detailed enrollment profile body.
 */
export default function EnrollmentDetails({ enrollment, className = "" }) {
  if (!enrollment) return null;

  const statusLabel = formatEnrollmentStatus(enrollment.status);
  const student = enrollment.student || {};
  const schoolClass = enrollment.schoolClass || {};
  const academicYear = enrollment.academicYear || {};
  const term = enrollment.term || {};
  const timeline = buildEnrollmentTimeline(enrollment);

  const studentLabel = formatStudentLabel(student);
  const classLabel = formatClassLabel(schoolClass);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={studentLabel}
        subtitle={classLabel}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Enrollment details">
        <ProfileDetailItem
          icon={ClipboardList}
          label="Enrollment number"
          value={enrollment.enrollmentNumber || "—"}
        />
        <ProfileDetailItem
          icon={User}
          label="Student"
          value={studentLabel}
        />
        <ProfileDetailItem
          icon={Users}
          label="Guardian"
          value={formatGuardianName(student)}
        />
        <ProfileDetailItem
          icon={School}
          label="Class"
          value={classLabel}
        />
        <ProfileDetailItem
          icon={User}
          label="Class teacher"
          value={formatTeacherName(schoolClass.classTeacher)}
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
              : "—"
          }
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Enrollment date"
          value={formatDisplayDate(enrollment.enrollmentDate)}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(enrollment.id)}
        />
      </ProfileSection>

      {enrollment.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={enrollment.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Placement summary"
        items={[
          {
            key: "student",
            label: "Student",
            value: student.firstName
              ? `${student.firstName} ${student.lastName || ""}`.trim()
              : "—",
            icon: User,
          },
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
            key: "date",
            label: "Enrolled",
            value: formatDisplayDate(enrollment.enrollmentDate),
            icon: CalendarRange,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
