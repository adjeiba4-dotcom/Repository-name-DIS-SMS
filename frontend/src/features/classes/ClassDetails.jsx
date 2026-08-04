import {
  Hash,
  Layers,
  School,
  UserRound,
  Users,
  FileText,
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
  buildClassTimeline,
  formatClassStatus,
  teacherDisplayName,
} from "./class.mappers";

/**
 * Detailed class profile body.
 */
export default function ClassDetails({ schoolClass, className = "" }) {
  if (!schoolClass) return null;

  const statusLabel = formatClassStatus(schoolClass.status);
  const counts = schoolClass._count || {};
  const academicYear = schoolClass.academicYear || {};
  const department = schoolClass.department || {};
  const classTeacher = schoolClass.classTeacher || {};
  const timeline = buildClassTimeline(schoolClass);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={schoolClass.className}
        subtitle={`${schoolClass.classCode} · School class`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Class details">
        <ProfileDetailItem
          icon={Layers}
          label="Academic year"
          value={academicYear.name || "—"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Class code"
          value={schoolClass.classCode || "—"}
        />
        <ProfileDetailItem
          icon={School}
          label="Department"
          value={department.name || "—"}
        />
        <ProfileDetailItem
          icon={UserRound}
          label="Class teacher"
          value={teacherDisplayName(classTeacher) || "—"}
        />
        <ProfileDetailItem
          icon={Users}
          label="Capacity"
          value={String(schoolClass.capacity ?? "—")}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(schoolClass.id)}
        />
      </ProfileSection>

      {schoolClass.description ? (
        <ProfileSection title="Description">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={schoolClass.description}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Usage summary"
        items={[
          {
            key: "students",
            label: "Students",
            value: String(counts.students ?? 0),
            icon: Users,
          },
          {
            key: "enrollments",
            label: "Enrollments",
            value: String(counts.enrollments ?? 0),
            icon: Layers,
          },
          {
            key: "subjects",
            label: "Subjects",
            value: String(counts.subjects ?? 0),
            icon: School,
          },
          {
            key: "timetables",
            label: "Timetables",
            value: String(counts.timetables ?? 0),
            icon: Hash,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
