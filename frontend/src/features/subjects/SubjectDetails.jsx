import {
  BookOpen,
  ClipboardList,
  FileText,
  Hash,
  Layers,
  School,
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
  buildSubjectTimeline,
  formatSubjectCategory,
  formatSubjectStatus,
} from "./subject.mappers";

/**
 * Detailed subject profile body.
 */
export default function SubjectDetails({ subject, className = "" }) {
  if (!subject) return null;

  const statusLabel = formatSubjectStatus(subject.status);
  const categoryLabel = formatSubjectCategory(subject.category);
  const counts = subject._count || {};
  const department = subject.department || {};
  const schoolClass = subject.schoolClass || {};
  const timeline = buildSubjectTimeline(subject);
  const classLabel = schoolClass.className
    ? `${schoolClass.className}${
        schoolClass.classCode ? ` (${schoolClass.classCode})` : ""
      }`
    : "—";
  const timetableCount =
    (counts.timetables ?? 0) + (counts.timetableEntries ?? 0);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={subject.subjectName}
        subtitle={`${subject.subjectCode} · ${subject.shortName || "Subject"}`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Subject details">
        <ProfileDetailItem
          icon={Hash}
          label="Subject code"
          value={subject.subjectCode || "—"}
        />
        <ProfileDetailItem
          icon={BookOpen}
          label="Short name"
          value={subject.shortName || "—"}
        />
        <ProfileDetailItem
          icon={Layers}
          label="Category"
          value={categoryLabel}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Credit hours"
          value={String(subject.creditHours ?? "—")}
        />
        <ProfileDetailItem
          icon={School}
          label="Department"
          value={department.name || "—"}
        />
        <ProfileDetailItem
          icon={Users}
          label="Assigned class"
          value={classLabel}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(subject.id)}
        />
      </ProfileSection>

      {subject.description ? (
        <ProfileSection title="Description">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={subject.description}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Usage summary"
        items={[
          {
            key: "teachers",
            label: "Teacher assignments",
            value: String(counts.teacherSubjects ?? 0),
            icon: Users,
          },
          {
            key: "classes",
            label: "Class allocations",
            value: String(counts.classSubjects ?? 0),
            icon: School,
          },
          {
            key: "assessments",
            label: "Assessments",
            value: String(counts.assessments ?? 0),
            icon: ClipboardList,
          },
          {
            key: "examinations",
            label: "Examinations",
            value: String(counts.examinations ?? 0),
            icon: Layers,
          },
          {
            key: "results",
            label: "Results",
            value: String(counts.results ?? 0),
            icon: BookOpen,
          },
          {
            key: "timetables",
            label: "Timetables",
            value: String(timetableCount),
            icon: Hash,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
