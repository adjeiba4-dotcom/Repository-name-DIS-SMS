/**
 * Map backend student promotion shapes to the workspace UI model.
 */

export const WORKFLOW_FILTER_OPTIONS = [
  { value: "all", label: "All workflow stages" },
  { value: "DRAFT", label: "Draft / Preview" },
  { value: "APPROVED", label: "Approved" },
  { value: "EXECUTED", label: "Executed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const DECISION_FILTER_OPTIONS = [
  { value: "all", label: "All decisions" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "PROMOTED_ON_PROBATION", label: "Promoted on Probation" },
  { value: "REPEAT", label: "Repeat" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "TRANSFERRED", label: "Transferred" },
];

export const DECISION_OPTIONS = [
  { value: "PROMOTED", label: "Promoted" },
  { value: "PROMOTED_ON_PROBATION", label: "Promoted on Probation" },
  { value: "REPEAT", label: "Repeat" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "TRANSFERRED", label: "Transferred" },
];

/** Shared with Report Cards module */
export const PROMOTION_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  ...DECISION_OPTIONS,
];

export const SUMMARY_SCOPE_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "class", label: "Class" },
];

const WORKFLOW_LABELS = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  EXECUTED: "Executed",
  CANCELLED: "Cancelled",
};

const DECISION_LABELS = {
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

export function formatWorkflowStatus(status) {
  return WORKFLOW_LABELS[status] ?? status ?? "—";
}

export function formatDecision(decision) {
  return DECISION_LABELS[decision] ?? decision ?? "—";
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
  if (Number.isNaN(num)) return "—";
  return num.toFixed(1);
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function mapPromotionToRow(item = {}) {
  const student = item.student || {};
  const fromClass = item.fromClass || {};
  const toClass = item.toClass || {};

  return {
    id: item.id,
    studentId: item.studentId,
    studentName: formatStudentName(student),
    admissionNo: student.admissionNo || "—",
    fromClassId: item.fromClassId,
    toClassId: item.toClassId,
    fromClassLabel: formatClassLabel(fromClass),
    toClassLabel: item.toClassId ? formatClassLabel(toClass) : "—",
    fromAcademicYearId: item.fromAcademicYearId,
    toAcademicYearId: item.toAcademicYearId,
    academicYearName: item.fromAcademicYear?.name || "—",
    toAcademicYearName: item.toAcademicYear?.name || "—",
    termId: item.termId,
    termName: item.term?.name || "—",
    reportCardId: item.reportCardId,
    decision: item.decision,
    decisionLabel: formatDecision(item.decision),
    workflowStatus: item.workflowStatus,
    workflowLabel: formatWorkflowStatus(item.workflowStatus),
    averageScore: item.averageScore,
    averageScoreLabel: formatScore(item.averageScore),
    overallGrade: item.overallGrade || "—",
    classPosition: item.classPosition ?? "—",
    remarks: item.remarks || "",
    recommendationNotes: item.recommendationNotes || "",
    recommendedAt: item.recommendedAt,
    approvedAt: item.approvedAt,
    executedAt: item.executedAt,
    promotionDate: item.promotionDate,
    resultingEnrollmentId: item.resultingEnrollmentId,
    enrollmentNumber: item.resultingEnrollment?.enrollmentNumber || "—",
    recommendedByName: item.recommendedBy
      ? [item.recommendedBy.firstName, item.recommendedBy.lastName]
          .filter(Boolean)
          .join(" ")
      : "—",
    approvedByName: item.approvedBy
      ? [item.approvedBy.firstName, item.approvedBy.lastName]
          .filter(Boolean)
          .join(" ")
      : "—",
    executedByName: item.executedBy
      ? [item.executedBy.firstName, item.executedBy.lastName]
          .filter(Boolean)
          .join(" ")
      : "—",
    status: item.status || "ACTIVE",
    raw: item,
  };
}

export function getPromotionStatsFromRows(rows = []) {
  return {
    total: rows.length,
    draft: rows.filter((r) => r.workflowStatus === "DRAFT").length,
    approved: rows.filter((r) => r.workflowStatus === "APPROVED").length,
    executed: rows.filter((r) => r.workflowStatus === "EXECUTED").length,
    graduated: rows.filter((r) => r.decision === "GRADUATED").length,
    promoted: rows.filter(
      (r) =>
        r.decision === "PROMOTED" || r.decision === "PROMOTED_ON_PROBATION"
    ).length,
  };
}

export function validateRecommendForm(form = {}) {
  const errors = {};
  if (!form.academicYearId) errors.academicYearId = "Academic year is required.";
  if (!form.classId && !form.studentId) {
    errors.classId = "Class is required to recommend promotions.";
  }
  return errors;
}

export function validateEditForm(form = {}) {
  const errors = {};
  if (!form.decision) errors.decision = "Decision is required.";
  const continuation = ["PROMOTED", "PROMOTED_ON_PROBATION", "REPEAT"];
  if (continuation.includes(form.decision)) {
    if (!form.toAcademicYearId) {
      errors.toAcademicYearId = "Destination academic year is required.";
    }
    if (!form.toClassId) {
      errors.toClassId = "Destination class is required.";
    }
  }
  return errors;
}
