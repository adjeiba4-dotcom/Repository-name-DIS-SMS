/**
 * Map backend enrollment shapes to the workspace UI model.
 */

export const ENROLLMENT_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatEnrollmentStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function formatDisplayDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
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

export function formatStudentName(student = {}) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ");
  return name || "—";
}

export function formatStudentLabel(student = {}) {
  const name = formatStudentName(student);
  if (name !== "—" && student.admissionNo) {
    return `${name} (${student.admissionNo})`;
  }
  return name !== "—" ? name : student.admissionNo || "—";
}

export function formatGuardianName(student = {}) {
  const links = student.studentGuardians || [];
  const primary =
    links.find((link) => link.isPrimary) || links[0] || null;
  const guardian = primary?.guardian;
  if (!guardian) return "—";
  const name = [guardian.firstName, guardian.lastName]
    .filter(Boolean)
    .join(" ");
  return name || guardian.guardianNumber || "—";
}

export function formatTeacherName(teacher = {}) {
  if (!teacher) return "—";
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  if (name && teacher.staffNo) return `${name} (${teacher.staffNo})`;
  return name || teacher.staffNo || "—";
}

export function formatClassLabel(schoolClass = {}) {
  if (!schoolClass) return "—";
  if (schoolClass.className) {
    return schoolClass.classCode
      ? `${schoolClass.className} (${schoolClass.classCode})`
      : schoolClass.className;
  }
  return schoolClass.classCode || "—";
}

export function mapEnrollmentToRow(enrollment) {
  const student = enrollment.student || {};
  const schoolClass = enrollment.schoolClass || {};
  const academicYear = enrollment.academicYear || {};
  const term = enrollment.term || {};

  return {
    id: String(enrollment.id),
    enrollmentNumber: enrollment.enrollmentNumber ?? "",
    studentId: enrollment.studentId ? String(enrollment.studentId) : "",
    studentName: formatStudentName(student),
    admissionNo: student.admissionNo ?? "",
    guardianName: formatGuardianName(student),
    schoolClassId: enrollment.schoolClassId
      ? String(enrollment.schoolClassId)
      : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    academicYearId: enrollment.academicYearId
      ? String(enrollment.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: enrollment.termId ? String(enrollment.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    enrollmentDate: enrollment.enrollmentDate ?? "",
    enrollmentDateLabel: formatDisplayDate(enrollment.enrollmentDate),
    remarks: enrollment.remarks ?? "",
    status: formatEnrollmentStatus(enrollment.status),
    createdAt: enrollment.createdAt ?? "",
    updatedAt: enrollment.updatedAt ?? "",
    deletedAt: enrollment.deletedAt ?? "",
  };
}

export function mapEnrollmentToForm(enrollment) {
  if (!enrollment) return null;

  const dateValue = enrollment.enrollmentDate
    ? String(enrollment.enrollmentDate).slice(0, 10)
    : "";

  return {
    studentId: enrollment.studentId ? String(enrollment.studentId) : "",
    schoolClassId: enrollment.schoolClassId
      ? String(enrollment.schoolClassId)
      : "",
    academicYearId: enrollment.academicYearId
      ? String(enrollment.academicYearId)
      : "",
    termId: enrollment.termId ? String(enrollment.termId) : "",
    enrollmentDate: dateValue,
    remarks: enrollment.remarks ?? "",
    status: formatEnrollmentStatus(enrollment.status) || "Active",
  };
}

export function buildEnrollmentPayload(form) {
  return {
    studentId: parseInt(form.studentId, 10),
    schoolClassId: parseInt(form.schoolClassId, 10),
    academicYearId: parseInt(form.academicYearId, 10),
    termId: form.termId ? parseInt(form.termId, 10) : null,
    enrollmentDate: form.enrollmentDate
      ? new Date(form.enrollmentDate).toISOString()
      : undefined,
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildEnrollmentTimeline(enrollment) {
  if (!enrollment) return [];

  const events = [];
  const studentLabel = formatStudentLabel(enrollment.student || {});
  const classLabel = formatClassLabel(enrollment.schoolClass || {});

  if (enrollment.createdAt) {
    events.push({
      id: "created",
      title: "Enrollment created",
      description: `${studentLabel} enrolled in ${classLabel}.`,
      timestamp: formatDisplayDateTime(enrollment.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    enrollment.updatedAt &&
    enrollment.updatedAt !== enrollment.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Enrollment details were modified.",
      timestamp: formatDisplayDateTime(enrollment.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (enrollment.deletedAt) {
    events.push({
      id: "archived",
      title: "Enrollment archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(enrollment.deletedAt),
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

export function getEnrollmentStats(enrollments = []) {
  return {
    total: enrollments.length,
    active: enrollments.filter((item) => item.status === "Active").length,
    inactive: enrollments.filter((item) => item.status === "Inactive")
      .length,
    archived: enrollments.filter(
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

export function validateEnrollmentForm(form) {
  const errors = {};

  if (!form.studentId) errors.studentId = "Student is required.";
  if (!form.schoolClassId) errors.schoolClassId = "Class is required.";
  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.enrollmentDate) {
    errors.enrollmentDate = "Enrollment date is required.";
  }
  if (!form.status) errors.status = "Status is required.";

  return errors;
}
