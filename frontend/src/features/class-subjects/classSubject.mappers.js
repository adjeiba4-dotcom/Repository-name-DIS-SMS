/**
 * Map backend class-subject allocation shapes to the workspace UI model.
 */

export const ALLOCATION_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatAllocationStatus(status) {
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

export function formatTeacherSubjectLabel(teacherSubject) {
  if (!teacherSubject) return "—";
  const teacher = teacherSubject.teacher || {};
  const subject = teacherSubject.subject || {};
  const year = teacherSubject.academicYear || {};
  const teacherName =
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") ||
    teacher.staffNo ||
    "Teacher";
  const subjectName = subject.subjectName || "Subject";
  const yearName = year.name || "Year";
  return `${teacherName} — ${subjectName} — ${yearName}`;
}

export function mapClassSubjectToRow(allocation) {
  const schoolClass = allocation.schoolClass || {};
  const subject = allocation.subject || {};
  const academicYear = allocation.academicYear || {};
  const term = allocation.term || {};
  const teacherSubject = allocation.teacherSubject || {};
  const teacher = teacherSubject.teacher || {};

  return {
    id: String(allocation.id),
    schoolClassId: allocation.schoolClassId
      ? String(allocation.schoolClassId)
      : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    teacherSubjectId: allocation.teacherSubjectId
      ? String(allocation.teacherSubjectId)
      : "",
    teacherSubjectLabel: formatTeacherSubjectLabel(teacherSubject),
    teacherName: formatTeacherName(teacher),
    subjectId: allocation.subjectId ? String(allocation.subjectId) : "",
    subjectName: subject.subjectName ?? "",
    subjectCode: subject.subjectCode ?? "",
    academicYearId: allocation.academicYearId
      ? String(allocation.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: allocation.termId ? String(allocation.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    weeklyPeriods: allocation.weeklyPeriods ?? 0,
    isCompulsory: Boolean(allocation.isCompulsory),
    isCompulsoryLabel: allocation.isCompulsory ? "Compulsory" : "Optional",
    displayOrder: allocation.displayOrder ?? 0,
    remarks: allocation.remarks ?? "",
    status: formatAllocationStatus(allocation.status),
    createdAt: allocation.createdAt ?? "",
    updatedAt: allocation.updatedAt ?? "",
    deletedAt: allocation.deletedAt ?? "",
  };
}

export function mapClassSubjectToForm(allocation) {
  if (!allocation) return null;

  return {
    schoolClassId: allocation.schoolClassId
      ? String(allocation.schoolClassId)
      : "",
    teacherSubjectId: allocation.teacherSubjectId
      ? String(allocation.teacherSubjectId)
      : "",
    academicYearId: allocation.academicYearId
      ? String(allocation.academicYearId)
      : "",
    termId: allocation.termId ? String(allocation.termId) : "",
    weeklyPeriods:
      allocation.weeklyPeriods != null
        ? String(allocation.weeklyPeriods)
        : "",
    isCompulsory: Boolean(allocation.isCompulsory),
    displayOrder:
      allocation.displayOrder != null
        ? String(allocation.displayOrder)
        : "0",
    remarks: allocation.remarks ?? "",
    status: formatAllocationStatus(allocation.status) || "Active",
  };
}

export function buildClassSubjectPayload(form) {
  return {
    schoolClassId: parseInt(form.schoolClassId, 10),
    teacherSubjectId: parseInt(form.teacherSubjectId, 10),
    academicYearId: form.academicYearId
      ? parseInt(form.academicYearId, 10)
      : undefined,
    termId: form.termId ? parseInt(form.termId, 10) : null,
    weeklyPeriods: parseInt(form.weeklyPeriods, 10),
    isCompulsory: Boolean(form.isCompulsory),
    displayOrder: form.displayOrder
      ? parseInt(form.displayOrder, 10)
      : 0,
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildClassSubjectTimeline(allocation) {
  if (!allocation) return [];

  const events = [];
  const classLabel =
    allocation.schoolClass?.className ||
    allocation.schoolClass?.classCode ||
    "Class";
  const subjectLabel = allocation.subject?.subjectName || "Subject";

  if (allocation.createdAt) {
    events.push({
      id: "created",
      title: "Allocation created",
      description: `${subjectLabel} allocated to ${classLabel}.`,
      timestamp: formatDisplayDateTime(allocation.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    allocation.updatedAt &&
    allocation.updatedAt !== allocation.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Allocation details were modified.",
      timestamp: formatDisplayDateTime(allocation.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (allocation.deletedAt) {
    events.push({
      id: "archived",
      title: "Allocation archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(allocation.deletedAt),
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

export function getClassSubjectStats(allocations = []) {
  return {
    total: allocations.length,
    active: allocations.filter((item) => item.status === "Active").length,
    inactive: allocations.filter((item) => item.status === "Inactive").length,
    archived: allocations.filter(
      (item) => item.status === "Archived" || item.deletedAt
    ).length,
    compulsory: allocations.filter((item) => item.isCompulsory).length,
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

export function validateClassSubjectForm(form) {
  const errors = {};

  if (!form.schoolClassId) errors.schoolClassId = "Class is required.";
  if (!form.teacherSubjectId) {
    errors.teacherSubjectId = "Teacher subject assignment is required.";
  }
  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }

  const weeklyPeriods = parseInt(form.weeklyPeriods, 10);
  if (!form.weeklyPeriods && form.weeklyPeriods !== 0) {
    errors.weeklyPeriods = "Weekly periods are required.";
  } else if (Number.isNaN(weeklyPeriods) || weeklyPeriods <= 0) {
    errors.weeklyPeriods = "Weekly periods must be greater than 0.";
  }

  if (form.displayOrder !== "" && form.displayOrder != null) {
    const displayOrder = parseInt(form.displayOrder, 10);
    if (Number.isNaN(displayOrder) || displayOrder < 0) {
      errors.displayOrder = "Display order must be a non-negative integer.";
    }
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
