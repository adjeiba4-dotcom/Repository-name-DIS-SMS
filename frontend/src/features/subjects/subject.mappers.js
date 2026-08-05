/**
 * Map backend subject shapes to the Subjects workspace UI model.
 */

export const SUBJECT_STATUS_OPTIONS = ["Active", "Inactive"];
export const SUBJECT_CATEGORY_OPTIONS = ["Core", "Elective"];

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

const CATEGORY_TO_API = {
  Core: "CORE",
  Elective: "ELECTIVE",
};

const CATEGORY_FROM_API = {
  CORE: "Core",
  ELECTIVE: "Elective",
};

export function formatSubjectStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function formatSubjectCategory(category) {
  return CATEGORY_FROM_API[category] ?? category ?? "—";
}

export function toApiCategory(category) {
  return CATEGORY_TO_API[category] ?? "CORE";
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

export function mapSubjectToRow(subject) {
  const counts = subject._count || {};
  const department = subject.department || {};
  const schoolClass = subject.schoolClass || {};

  return {
    id: String(subject.id),
    subjectCode: subject.subjectCode ?? "",
    subjectName: subject.subjectName ?? "",
    shortName: subject.shortName ?? "",
    departmentId: subject.departmentId ? String(subject.departmentId) : "",
    departmentName: department.name ?? "",
    schoolClassId: subject.schoolClassId
      ? String(subject.schoolClassId)
      : "",
    schoolClassName: schoolClass.className
      ? `${schoolClass.className}${
          schoolClass.classCode ? ` (${schoolClass.classCode})` : ""
        }`
      : "",
    category: formatSubjectCategory(subject.category),
    creditHours: subject.creditHours ?? 0,
    description: subject.description ?? "",
    status: formatSubjectStatus(subject.status),
    teacherAssignmentCount: counts.teacherSubjects ?? 0,
    examinationCount: counts.examinations ?? 0,
    resultCount: counts.results ?? 0,
    timetableCount: counts.timetables ?? 0,
    createdAt: subject.createdAt ?? "",
    updatedAt: subject.updatedAt ?? "",
    deletedAt: subject.deletedAt ?? "",
  };
}

export function mapSubjectToForm(subject) {
  if (!subject) return null;

  return {
    subjectCode: subject.subjectCode ?? "",
    subjectName: subject.subjectName ?? "",
    shortName: subject.shortName ?? "",
    departmentId: subject.departmentId
      ? String(subject.departmentId)
      : "",
    schoolClassId: subject.schoolClassId
      ? String(subject.schoolClassId)
      : "",
    category: formatSubjectCategory(subject.category) || "Core",
    creditHours:
      subject.creditHours != null ? String(subject.creditHours) : "",
    description: subject.description ?? "",
    status: formatSubjectStatus(subject.status) || "Active",
  };
}

export function buildSubjectPayload(form) {
  return {
    subjectCode: form.subjectCode.trim(),
    subjectName: form.subjectName.trim(),
    shortName: form.shortName.trim(),
    departmentId: form.departmentId
      ? parseInt(form.departmentId, 10)
      : null,
    schoolClassId: form.schoolClassId
      ? parseInt(form.schoolClassId, 10)
      : null,
    category: toApiCategory(form.category),
    creditHours: parseInt(form.creditHours, 10),
    description: form.description?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildSubjectTimeline(subject) {
  if (!subject) return [];

  const events = [];

  if (subject.createdAt) {
    events.push({
      id: "created",
      title: "Subject created",
      description: `${subject.subjectName} (${subject.subjectCode}) registered.`,
      timestamp: formatDisplayDateTime(subject.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    subject.updatedAt &&
    subject.updatedAt !== subject.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Subject details were modified.",
      timestamp: formatDisplayDateTime(subject.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (subject.deletedAt) {
    events.push({
      id: "archived",
      title: "Subject archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(subject.deletedAt),
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

export function getSubjectStats(subjects = []) {
  return {
    total: subjects.length,
    active: subjects.filter((item) => item.status === "Active").length,
    inactive: subjects.filter((item) => item.status === "Inactive").length,
    archived: subjects.filter(
      (item) => item.status === "Archived" || item.deletedAt
    ).length,
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

export function validateSubjectForm(form) {
  const errors = {};

  if (!form.subjectCode?.trim()) {
    errors.subjectCode = "Subject code is required.";
  }
  if (!form.subjectName?.trim()) {
    errors.subjectName = "Subject name is required.";
  }
  if (!form.shortName?.trim()) {
    errors.shortName = "Short name is required.";
  }
  if (!form.category) {
    errors.category = "Category is required.";
  }

  const creditHours = parseInt(form.creditHours, 10);
  if (!form.creditHours && form.creditHours !== 0) {
    errors.creditHours = "Credit hours are required.";
  } else if (Number.isNaN(creditHours) || creditHours <= 0) {
    errors.creditHours = "Credit hours must be greater than 0.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
