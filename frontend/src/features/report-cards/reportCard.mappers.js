/**
 * Map backend report card shapes to the workspace UI model.
 */

export const WORKFLOW_FILTER_OPTIONS = [
  { value: "all", label: "All workflow stages" },
  { value: "DRAFT", label: "Draft" },
  { value: "GENERATED", label: "Generated" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PUBLISHED", label: "Published" },
  { value: "LOCKED", label: "Locked" },
];

export const PROMOTION_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "PROMOTED_ON_PROBATION", label: "Promoted on Probation" },
  { value: "REPEAT", label: "Repeat" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "TRANSFERRED", label: "Transferred" },
];

export const SUMMARY_SCOPE_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "class", label: "Class" },
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

const PROMOTION_LABELS = {
  PENDING: "Pending",
  PROMOTED: "Promoted",
  PROMOTED_ON_PROBATION: "Promoted on Probation",
  REPEAT: "Repeat",
  GRADUATED: "Graduated",
  WITHDRAWN: "Withdrawn",
  TRANSFERRED: "Transferred",
  CONDITIONAL: "Promoted on Probation",
  DEFERRED: "Pending",
};

export function formatReportCardStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function formatWorkflowStatus(status, item = {}) {
  if (status && WORKFLOW_LABELS[status]) return WORKFLOW_LABELS[status];
  if (item.isLocked) return "Locked";
  if (item.isPublished) return "Published";
  if (item.isVerified) return "Verified";
  return "Generated";
}

export function formatPromotion(decision, promoted = false) {
  if (decision && PROMOTION_LABELS[decision]) return PROMOTION_LABELS[decision];
  return promoted ? "Promoted" : "Pending";
}

export function formatClassLabel(schoolClass = {}) {
  if (!schoolClass) return "—";
  if (schoolClass.className && schoolClass.classCode) {
    return `${schoolClass.className} (${schoolClass.classCode})`;
  }
  return schoolClass.className || schoolClass.classCode || "—";
}

export function formatStudentName(student = {}) {
  if (!student) return "—";
  const name = [student.firstName, student.otherName, student.lastName]
    .filter(Boolean)
    .join(" ");
  return name || "—";
}

export function formatScore(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function mapReportCardToRow(card = {}) {
  const student = card.student || {};
  return {
    id: card.id,
    studentId: card.studentId,
    academicYearId: card.academicYearId,
    termId: card.termId,
    classId: card.classId,
    templateKey: card.templateKey || "STANDARD_A4",
    admissionNo: student.admissionNo || "—",
    studentName: formatStudentName(student),
    classLabel: formatClassLabel(card.schoolClass),
    academicYearName: card.academicYear?.name || "—",
    termName: card.term?.name || "—",
    averageScore: card.averageScore,
    averageScoreLabel: formatScore(card.averageScore),
    overallGrade: card.overallGrade || "—",
    classPosition: card.classPosition ?? "—",
    subjectCount: card.subjectCount ?? 0,
    passedCount: card.passedCount ?? 0,
    failedCount: card.failedCount ?? 0,
    attendancePercentage: card.attendancePercentage,
    attendanceLabel:
      card.attendancePercentage == null
        ? "—"
        : `${formatScore(card.attendancePercentage)}%`,
    promotionDecision: card.promotionDecision || "PENDING",
    promotionLabel: formatPromotion(card.promotionDecision, card.promoted),
    promoted: Boolean(card.promoted),
    teacherRemarks: card.teacherRemarks || "",
    headmasterRemarks: card.headmasterRemarks || "",
    workflowStatus: card.workflowStatus,
    workflowLabel: formatWorkflowStatus(card.workflowStatus, card),
    isVerified: Boolean(card.isVerified),
    isPublished: Boolean(card.isPublished),
    isLocked: Boolean(card.isLocked),
    publishedLabel: card.isPublished ? "Yes" : "No",
    lockedLabel: card.isLocked ? "Yes" : "No",
    status: formatReportCardStatus(card.status),
    rawStatus: card.status,
    generatedAt: card.generatedAt,
    publishedAt: card.publishedAt,
    snapshot: card.snapshot,
    _raw: card,
  };
}

export function getReportCardStatsFromRows(rows = []) {
  const total = rows.length;
  const verified = rows.filter((r) => r.isVerified).length;
  const published = rows.filter((r) => r.isPublished).length;
  const locked = rows.filter((r) => r.isLocked).length;
  const promoted = rows.filter(
    (r) =>
      r.promotionDecision === "PROMOTED" ||
      r.promotionDecision === "PROMOTED_ON_PROBATION" ||
      r.promoted
  ).length;
  const averages = rows
    .map((r) => Number(r.averageScore))
    .filter((n) => !Number.isNaN(n));
  const average =
    averages.length > 0
      ? Math.round(
          (averages.reduce((sum, n) => sum + n, 0) / averages.length) * 10
        ) / 10
      : 0;
  return { total, verified, published, locked, promoted, average };
}

export function buildGeneratePayload(form = {}) {
  return {
    studentId: form.studentId ? Number(form.studentId) : undefined,
    academicYearId: Number(form.academicYearId),
    termId: Number(form.termId),
    classId: form.classId ? Number(form.classId) : undefined,
    templateKey: form.templateKey || "STANDARD_A4",
    teacherRemarks: form.teacherRemarks?.trim() || undefined,
    headmasterRemarks: form.headmasterRemarks?.trim() || undefined,
    promotionDecision: form.promotionDecision || "PENDING",
    regenerate: Boolean(form.regenerate),
    asDraft: Boolean(form.asDraft),
  };
}

export function buildBulkGeneratePayload(form = {}) {
  return {
    academicYearId: Number(form.academicYearId),
    termId: Number(form.termId),
    classId: Number(form.classId),
    templateKey: form.templateKey || "STANDARD_A4",
    teacherRemarks: form.teacherRemarks?.trim() || undefined,
    headmasterRemarks: form.headmasterRemarks?.trim() || undefined,
    promotionDecision: form.promotionDecision || "PENDING",
    regenerate: Boolean(form.regenerate),
    asDraft: Boolean(form.asDraft),
  };
}

export function validateGenerateForm(form = {}, { bulk = false } = {}) {
  const errors = {};
  if (!form.academicYearId) errors.academicYearId = "Academic year is required.";
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) {
    errors.classId = bulk
      ? "Class is required for bulk generation."
      : "Class is required to load enrolled students.";
  }
  if (!bulk && !form.studentId) {
    errors.studentId = "Student is required.";
  }
  return errors;
}

export function validateRemarksForm(form = {}) {
  const errors = {};
  if (form.teacherRemarks && form.teacherRemarks.length > 2000) {
    errors.teacherRemarks = "Teacher remarks must be at most 2000 characters.";
  }
  if (form.headmasterRemarks && form.headmasterRemarks.length > 2000) {
    errors.headmasterRemarks =
      "Headmaster remarks must be at most 2000 characters.";
  }
  return errors;
}
