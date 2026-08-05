/**
 * Map backend teacher-subject assignment shapes to the workspace UI model.
 */

export const ASSIGNMENT_STATUS_OPTIONS = ["Active", "Inactive"];

const STATUS_TO_API = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
  Archived: "ARCHIVED",
};

const STATUS_FROM_API = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export function formatAssignmentStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function formatDisplayDateTime(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatTeacherName(teacher = {}) {
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  if (name && teacher.staffNo) return `${name} (${teacher.staffNo})`;
  return name || teacher.staffNo || "—";
}

export function mapTeacherSubjectToRow(assignment) {
  const teacher = assignment.teacher || {};
  const subject = assignment.subject || {};
  const academicYear = assignment.academicYear || {};
  const term = assignment.term || {};

  return {
    id: String(assignment.id),
    teacherId: assignment.teacherId ? String(assignment.teacherId) : "",
    teacherName: formatTeacherName(teacher),
    subjectId: assignment.subjectId ? String(assignment.subjectId) : "",
    subjectName: subject.subjectName ?? "",
    subjectCode: subject.subjectCode ?? "",
    academicYearId: assignment.academicYearId
      ? String(assignment.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: assignment.termId ? String(assignment.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    isPrimary: Boolean(assignment.isPrimary),
    isPrimaryLabel: assignment.isPrimary ? "Primary" : "Secondary",
    weeklyPeriods: assignment.weeklyPeriods ?? 0,
    remarks: assignment.remarks ?? "",
    status: formatAssignmentStatus(assignment.status),
    createdAt: assignment.createdAt ?? "",
    updatedAt: assignment.updatedAt ?? "",
    deletedAt: assignment.deletedAt ?? "",
  };
}

export function mapTeacherSubjectToForm(assignment) {
  if (!assignment) return null;

  return {
    teacherId: assignment.teacherId ? String(assignment.teacherId) : "",
    subjectId: assignment.subjectId ? String(assignment.subjectId) : "",
    academicYearId: assignment.academicYearId
      ? String(assignment.academicYearId)
      : "",
    termId: assignment.termId ? String(assignment.termId) : "",
    isPrimary: Boolean(assignment.isPrimary),
    weeklyPeriods:
      assignment.weeklyPeriods != null
        ? String(assignment.weeklyPeriods)
        : "",
    remarks: assignment.remarks ?? "",
    status: formatAssignmentStatus(assignment.status) || "Active",
  };
}

export function buildTeacherSubjectPayload(form) {
  return {
    teacherId: parseInt(form.teacherId, 10),
    subjectId: parseInt(form.subjectId, 10),
    academicYearId: parseInt(form.academicYearId, 10),
    termId: form.termId ? parseInt(form.termId, 10) : null,
    isPrimary: Boolean(form.isPrimary),
    weeklyPeriods: parseInt(form.weeklyPeriods, 10),
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildTeacherSubjectTimeline(assignment) {
  if (!assignment) return [];

  const events = [];
  const teacherLabel = formatTeacherName(assignment.teacher);
  const subjectLabel = assignment.subject?.subjectName || "Subject";

  if (assignment.createdAt) {
    events.push({
      id: "created",
      title: "Assignment created",
      description: `${teacherLabel} assigned to ${subjectLabel}.`,
      timestamp: formatDisplayDateTime(assignment.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    assignment.updatedAt &&
    assignment.updatedAt !== assignment.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Assignment details were modified.",
      timestamp: formatDisplayDateTime(assignment.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (assignment.deletedAt) {
    events.push({
      id: "archived",
      title: "Assignment archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(assignment.deletedAt),
      status: "ARCHIVED",
      statusLabel: "Archived",
    });
  }

  return events.sort((a, b) => {
    const left = new Date(a.timestamp).getTime() || 0;
    const right = new Date(b.timestamp).getTime() || 0;
    return right - left;
  });
}

export function getTeacherSubjectStats(assignments = []) {
  return {
    total: assignments.length,
    active: assignments.filter((item) => item.status === "Active").length,
    inactive: assignments.filter((item) => item.status === "Inactive").length,
    archived: assignments.filter(
      (item) => item.status === "Archived" || item.deletedAt
    ).length,
    primary: assignments.filter((item) => item.isPrimary).length,
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    if (first?.msg) return first.msg;
    if (first?.message) return first.message;
  }

  if (data.errors && typeof data.errors === "object") {
    const values = Object.values(data.errors).flat();
    if (values.length > 0) {
      const first = values[0];
      if (typeof first === "string") return first;
      if (first?.msg) return first.msg;
    }
  }

  return fallback;
}

export function validateTeacherSubjectForm(form) {
  const errors = {};

  if (!form.teacherId) errors.teacherId = "Teacher is required.";
  if (!form.subjectId) errors.subjectId = "Subject is required.";
  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }

  const weeklyPeriods = parseInt(form.weeklyPeriods, 10);
  if (!form.weeklyPeriods && form.weeklyPeriods !== 0) {
    errors.weeklyPeriods = "Weekly periods are required.";
  } else if (Number.isNaN(weeklyPeriods) || weeklyPeriods <= 0) {
    errors.weeklyPeriods = "Weekly periods must be greater than 0.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
