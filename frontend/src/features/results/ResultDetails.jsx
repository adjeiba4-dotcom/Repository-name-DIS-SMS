import {
  Award,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileText,
  Hash,
  School,
  User,
} from "lucide-react";

import {
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
} from "../../components/profile";
import { cn } from "../../utils/cn";
import {
  formatClassLabel,
  formatResultStatus,
  formatScore,
  formatStudentName,
  formatSubjectLabel,
  formatWorkflowStatus,
} from "./result.mappers";

export default function ResultDetails({ result, className = "" }) {
  if (!result) return null;

  const statusLabel = formatResultStatus(result.status);
  const studentName = formatStudentName(result.student || {});
  const classLabel = formatClassLabel(result.schoolClass || {});
  const subjectLabel = formatSubjectLabel(result.subject || {});

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={studentName}
        subtitle={`${classLabel} · ${subjectLabel}`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Composite scores">
        <ProfileDetailItem
          icon={ClipboardList}
          label="CA score"
          value={formatScore(result.caScore)}
        />
        <ProfileDetailItem
          icon={ClipboardList}
          label="Exam score"
          value={formatScore(result.examScore)}
        />
        <ProfileDetailItem
          icon={Award}
          label="Final score"
          value={formatScore(result.finalScore)}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Weights (CA / Exam)"
          value={`${formatScore(result.caWeight)} / ${formatScore(result.examWeight)}`}
        />
        <ProfileDetailItem
          icon={Award}
          label="Grade"
          value={result.grade?.grade || result.gradeLetter || "—"}
        />
        <ProfileDetailItem
          icon={FileText}
          label="Outcome"
          value={result.isPassed ? "Pass" : "Fail"}
        />
      </ProfileSection>

      <ProfileSection title="Positions & averages">
        <ProfileDetailItem
          icon={Hash}
          label="Subject position"
          value={result.subjectPosition ?? "—"}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Class position"
          value={result.classPosition ?? "—"}
        />
        <ProfileDetailItem
          icon={Award}
          label="Subject average"
          value={formatScore(result.subjectAverage)}
        />
        <ProfileDetailItem
          icon={Award}
          label="Class average"
          value={formatScore(result.classAverage)}
        />
      </ProfileSection>

      <ProfileSection title="Scope">
        <ProfileDetailItem icon={User} label="Student" value={studentName} />
        <ProfileDetailItem
          icon={Hash}
          label="Admission no."
          value={result.student?.admissionNo || "—"}
        />
        <ProfileDetailItem icon={School} label="Class" value={classLabel} />
        <ProfileDetailItem
          icon={BookOpen}
          label="Subject"
          value={subjectLabel}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Academic year"
          value={result.academicYear?.name || "—"}
        />
        <ProfileDetailItem
          icon={CalendarRange}
          label="Term"
          value={result.term?.name || result.term?.code || "—"}
        />
        <ProfileDetailItem
          icon={ClipboardList}
          label="Source examination"
          value={
            result.examination?.name ||
            result.examination?.examinationType ||
            "—"
          }
        />
        <ProfileDetailItem
          icon={FileText}
          label="Workflow"
          value={formatWorkflowStatus(result.workflowStatus, result)}
        />
        <ProfileDetailItem
          icon={FileText}
          label="Release flags"
          value={`${result.isVerified ? "Verified" : "Unverified"} · ${
            result.isPublished ? "Published" : "Unpublished"
          } · ${result.isLocked ? "Locked" : "Open"}`}
        />
      </ProfileSection>

      {result.remarks ? (
        <ProfileSection title="Remark">
          <ProfileDetailItem
            icon={FileText}
            label="Grade remark"
            value={result.remarks}
          />
        </ProfileSection>
      ) : null}
    </div>
  );
}
