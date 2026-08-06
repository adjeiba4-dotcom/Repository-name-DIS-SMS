/**
 * Map backend result shapes to the workspace UI model.
 */

export const RESULT_STATUS_OPTIONS = ["Active", "Inactive"];

export const SUMMARY_SCOPE_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "class", label: "Class" },
  { value: "subject", label: "Subject" },
  { value: "student", label: "Student" },
  { value: "grade", label: "Grade" },
];

export const PASS_FILTER_OPTIONS = [
  { value: "all", label: "All outcomes" },
  { value: "true", label: "Passed" },
  { value: "false", label: "Failed" },
];

export const PUBLISH_FILTER_OPTIONS = [
  { value: "all", label: "All publish states" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
];

export const WORKFLOW_FILTER_OPTIONS = [
  { value: "all", label: "All workflow stages" },
  { value: "DRAFT", label: "Draft" },
  { value: "GENERATED", label: "Generated" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PUBLISHED", label: "Published" },
  { value: "LOCKED", label: "Locked" },
];

const STATUS_FROM_API = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

const WORKFLOW_LABELS = {
  DRAFT: "Draft",
  GENERATED: "Generated",
  VERIFIED: "Verified",
  PUBLISHED: "Published",
  LOCKED: "Locked",
};

export function formatResultStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function formatWorkflowStatus(status, item = {}) {
  if (status && WORKFLOW_LABELS[status]) return WORKFLOW_LABELS[status];
  if (item.isLocked) return "Locked";
  if (item.isPublished) return "Published";
  if (item.isVerified) return "Verified";
  return "Generated";
}

export function formatClassLabel(schoolClass = {}) {
  if (!schoolClass) return "—";
  if (schoolClass.className && schoolClass.classCode) {
    return `${schoolClass.className} (${schoolClass.classCode})`;
  }
  return schoolClass.className || schoolClass.classCode || "—";
}

export function formatSubjectLabel(subject = {}) {
  if (!subject) return "—";
  if (subject.subjectName && subject.subjectCode) {
    return `${subject.subjectName} (${subject.subjectCode})`;
  }
  return subject.subjectName || subject.subjectCode || "—";
}

export function formatStudentName(student = {}) {
  if (!student) return "—";
  const name = [student.firstName, student.otherName, student.lastName]
    .filter(Boolean)
    .join(" ");
  return name || "—";
}

export function formatScore(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function mapResultToRow(item = {}) {
  const student = item.student || {};
  const schoolClass = item.schoolClass || {};
  const subject = item.subject || {};
  const grade = item.grade || {};
  const examination = item.examination || {};
  const workflowStatus =
    item.workflowStatus ||
    (item.isLocked
      ? "LOCKED"
      : item.isPublished
        ? "PUBLISHED"
        : item.isVerified
          ? "VERIFIED"
          : "GENERATED");

  return {
    id: item.id,
    studentId: item.studentId,
    admissionNo: student.admissionNo || "—",
    studentName: formatStudentName(student),
    classId: item.classId,
    classLabel: formatClassLabel(schoolClass),
    className: schoolClass.className || "",
    classCode: schoolClass.classCode || "",
    subjectId: item.subjectId,
    subjectLabel: formatSubjectLabel(subject),
    subjectName: subject.subjectName || "",
    subjectCode: subject.subjectCode || "",
    academicYearId: item.academicYearId,
    academicYearName: item.academicYear?.name || "—",
    termId: item.termId,
    termName: item.term?.name || item.term?.code || "—",
    examinationId: item.examinationId,
    examinationName: examination.name || examination.examinationType || "—",
    caScore: item.caScore,
    examScore: item.examScore,
    caWeight: item.caWeight,
    examWeight: item.examWeight,
    finalScore: item.finalScore,
    caScoreLabel: formatScore(item.caScore),
    examScoreLabel: formatScore(item.examScore),
    finalScoreLabel: formatScore(item.finalScore),
    weightsLabel: `${formatScore(item.caWeight)} / ${formatScore(item.examWeight)}`,
    gradeLetter: item.gradeLetter || grade.grade || "—",
    gradeId: item.gradeId,
    remarks: item.remarks || "—",
    subjectPosition: item.subjectPosition ?? "—",
    classPosition: item.classPosition ?? "—",
    subjectAverage: formatScore(item.subjectAverage),
    classAverage: formatScore(item.classAverage),
    isPassed: Boolean(item.isPassed),
    passFailLabel: item.isPassed ? "Pass" : "Fail",
    workflowStatus,
    workflowLabel: formatWorkflowStatus(workflowStatus, item),
    isVerified: Boolean(item.isVerified || ["VERIFIED", "PUBLISHED", "LOCKED"].includes(workflowStatus)),
    isPublished: Boolean(item.isPublished),
    publishedLabel: item.isPublished ? "Published" : "Unpublished",
    isLocked: Boolean(item.isLocked),
    lockedLabel: item.isLocked ? "Locked" : "Open",
    status: formatResultStatus(item.status),
    statusRaw: item.status,
    raw: item,
  };
}

export function getResultStatsFromRows(rows = []) {
  const passed = rows.filter((row) => row.isPassed).length;
  const verified = rows.filter((row) => row.isVerified).length;
  const published = rows.filter((row) => row.isPublished).length;
  const locked = rows.filter((row) => row.isLocked).length;
  const scores = rows
    .map((row) => Number(row.finalScore))
    .filter((value) => !Number.isNaN(value));
  const average = scores.length
    ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) /
      10
    : 0;

  return {
    total: rows.length,
    passed,
    verified,
    published,
    locked,
    average,
  };
}

export function flattenBroadsheet(broadsheet = {}) {
  const subjects = broadsheet.subjects || [];
  return (broadsheet.students || []).map((student) => {
    const row = {
      admissionNo: student.admissionNo || "—",
      studentName: student.studentName || "—",
      classPosition: student.classPosition ?? "—",
      average: formatScore(student.average),
      passedCount: student.passedCount ?? 0,
    };
    subjects.forEach((subject) => {
      const cell = student.cells?.[subject.id];
      const key = subject.subjectCode || subject.subjectName || `S${subject.id}`;
      row[key] = cell
        ? `${formatScore(cell.finalScore)}${cell.grade ? ` (${cell.grade})` : ""}`
        : "—";
    });
    return row;
  });
}

export function validateGenerateForm(form = {}) {
  const errors = {};
  if (!form.academicYearId) errors.academicYearId = "Academic year is required.";
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) errors.classId = "Class is required.";
  if (!form.subjectId) errors.subjectId = "Subject is required.";
  return errors;
}

export function buildGeneratePayload(form = {}) {
  const payload = {
    academicYearId: Number(form.academicYearId),
    termId: Number(form.termId),
    classId: Number(form.classId),
    subjectId: Number(form.subjectId),
    examinationId: form.examinationId ? Number(form.examinationId) : undefined,
    regenerate: Boolean(form.regenerate),
    asDraft: Boolean(form.asDraft),
  };
  if (form.caWeight !== "" && form.caWeight != null) {
    payload.caWeight = Number(form.caWeight);
  }
  if (form.examWeight !== "" && form.examWeight != null) {
    payload.examWeight = Number(form.examWeight);
  }
  return payload;
}
