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
  buildExaminationTimeline,
  formatExaminationStatus,
  formatExaminationType,
  formatClassLabel,
  formatDisplayDate,
  formatSubjectLabel,
  formatTeacherName,
} from "./examination.mappers";

export default function ExaminationDetails({ examination, className = "" }) {
  if (!examination) return null;

  const statusLabel = formatExaminationStatus(examination.status);
  const typeLabel = formatExaminationType(examination.examinationType);
  const classLabel = formatClassLabel(examination.schoolClass || {});
  const subjectLabel = formatSubjectLabel(examination.subject || {});
  const teacherLabel = formatTeacherName(examination.teacher || {});
  const timeline = buildExaminationTimeline(examination);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={examination.name || typeLabel}
        subtitle={`${classLabel} · ${subjectLabel}`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Examination details">
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
          value={examination.academicYear?.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={
            examination.term?.name
              ? `${examination.term.name}${
                  examination.term.code ? ` (${examination.term.code})` : ""
                }`
              : "—"
          }
        />
        <ProfileDetailItem
          icon={ClipboardList}
          label="Date & marks"
          value={`${formatDisplayDate(examination.examinationDate)} · Max ${examination.maxMarks} · Pass ${examination.passingMarks}`}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Duration & access"
          value={`${examination.durationMinutes ?? "—"} minutes · ${examination.isLocked ? "Locked" : "Open"}`}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(examination.id)}
        />
      </ProfileSection>

      {examination.remarks ? (
        <ProfileSection title="Remarks">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={examination.remarks}
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
              examination.scoreCount ?? examination.scores?.length ?? 0
            ),
            icon: ClipboardList,
          },
          {
            key: "max",
            label: "Maximum marks",
            value: String(examination.maxMarks ?? "—"),
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
