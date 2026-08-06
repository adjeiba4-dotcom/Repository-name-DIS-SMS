import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileCheck2,
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
  buildAssessmentTimeline,
  formatAssessmentStatus,
  formatAssessmentType,
  formatClassLabel,
  formatDisplayDate,
  formatSubjectLabel,
  formatTeacherName,
} from "./assessment.mappers";

export default function AssessmentDetails({ assessment, className = "" }) {
  if (!assessment) return null;

  const statusLabel = formatAssessmentStatus(assessment.status);
  const typeLabel = formatAssessmentType(assessment.assessmentType);
  const classLabel = formatClassLabel(assessment.schoolClass || {});
  const subjectLabel = formatSubjectLabel(assessment.subject || {});
  const teacherLabel = formatTeacherName(assessment.teacher || {});
  const timeline = buildAssessmentTimeline(assessment);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={assessment.title || typeLabel}
        subtitle={`${classLabel} · ${subjectLabel}`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Assessment details">
        <ProfileDetailItem icon={FileCheck2} label="Type" value={typeLabel} />
        <ProfileDetailItem icon={School} label="Class" value={classLabel} />
        <ProfileDetailItem
          icon={BookOpen}
          label="Subject"
          value={subjectLabel}
        />
        <ProfileDetailItem icon={User} label="Teacher" value={teacherLabel} />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Academic year"
          value={assessment.academicYear?.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={
            assessment.term?.name
              ? `${assessment.term.name}${
                  assessment.term.code ? ` (${assessment.term.code})` : ""
                }`
              : "—"
          }
        />
        <ProfileDetailItem
          icon={ClipboardList}
          label="Date & max marks"
          value={`${formatDisplayDate(assessment.assessmentDate)} · ${assessment.maxMarks}`}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(assessment.id)}
        />
      </ProfileSection>

      {assessment.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={assessment.remarks}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Score summary"
        items={[
          {
            key: "scores",
            label: "Scores entered",
            value: String(
              assessment.scoreCount ?? assessment.scores?.length ?? 0
            ),
            icon: ClipboardList,
          },
          {
            key: "max",
            label: "Maximum marks",
            value: String(assessment.maxMarks ?? "—"),
            icon: FileCheck2,
          },
          {
            key: "class",
            label: "Class",
            value: classLabel,
            icon: School,
          },
          {
            key: "subject",
            label: "Subject",
            value: subjectLabel,
            icon: BookOpen,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
