/**
 * Map backend class shapes to the Classes workspace UI model.
 */

export const CLASS_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatClassStatus(status) {
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

export function teacherDisplayName(teacher) {
  if (!teacher) return "";
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  return name || teacher.staffNo || "";
}

export function mapClassToRow(schoolClass) {
  const counts = schoolClass._count || {};
  const academicYear = schoolClass.academicYear || {};
  const department = schoolClass.department || {};
  const classTeacher = schoolClass.classTeacher || {};

  return {
    id: String(schoolClass.id),
    classCode: schoolClass.classCode ?? "",
    className: schoolClass.className ?? "",
    academicYearId: String(
      schoolClass.academicYearId ?? academicYear.id ?? ""
    ),
    academicYearName: academicYear.name ?? "",
    departmentId: schoolClass.departmentId
      ? String(schoolClass.departmentId)
      : "",
    departmentName: department.name ?? "",
    classTeacherId: schoolClass.classTeacherId
      ? String(schoolClass.classTeacherId)
      : "",
    classTeacherName: teacherDisplayName(classTeacher),
    capacity: schoolClass.capacity ?? 0,
    description: schoolClass.description ?? "",
    status: formatClassStatus(schoolClass.status),
    studentCount: counts.students ?? 0,
    enrollmentCount: counts.enrollments ?? 0,
    subjectCount: counts.subjects ?? 0,
    feeStructureCount: counts.feeStructures ?? 0,
    timetableCount: counts.timetables ?? 0,
    createdAt: schoolClass.createdAt ?? "",
    updatedAt: schoolClass.updatedAt ?? "",
    deletedAt: schoolClass.deletedAt ?? "",
  };
}

export function mapClassToForm(schoolClass) {
  if (!schoolClass) return null;

  return {
    classCode: schoolClass.classCode ?? "",
    className: schoolClass.className ?? "",
    academicYearId: String(
      schoolClass.academicYearId ?? schoolClass.academicYear?.id ?? ""
    ),
    departmentId: schoolClass.departmentId
      ? String(schoolClass.departmentId)
      : "",
    classTeacherId: schoolClass.classTeacherId
      ? String(schoolClass.classTeacherId)
      : "",
    capacity: schoolClass.capacity != null ? String(schoolClass.capacity) : "",
    description: schoolClass.description ?? "",
    status: formatClassStatus(schoolClass.status) || "Active",
  };
}

export function buildClassPayload(form) {
  const payload = {
    classCode: form.classCode.trim(),
    className: form.className.trim(),
    academicYearId: parseInt(form.academicYearId, 10),
    capacity: parseInt(form.capacity, 10),
    status: toApiStatus(form.status),
  };

  if (form.departmentId) {
    payload.departmentId = parseInt(form.departmentId, 10);
  } else {
    payload.departmentId = null;
  }

  if (form.classTeacherId) {
    payload.classTeacherId = parseInt(form.classTeacherId, 10);
  } else {
    payload.classTeacherId = null;
  }

  const description = form.description?.trim();
  payload.description = description ? description : null;

  return payload;
}

export function buildClassTimeline(schoolClass) {
  if (!schoolClass) return [];

  const events = [];

  if (schoolClass.createdAt) {
    events.push({
      id: "created",
      title: "Class created",
      description: `${schoolClass.className} (${schoolClass.classCode}) registered.`,
      timestamp: formatDisplayDateTime(schoolClass.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    schoolClass.updatedAt &&
    schoolClass.updatedAt !== schoolClass.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Class details were modified.",
      timestamp: formatDisplayDateTime(schoolClass.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (schoolClass.deletedAt) {
    events.push({
      id: "archived",
      title: "Class archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(schoolClass.deletedAt),
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

export function getClassStats(classes = []) {
  return {
    total: classes.length,
    active: classes.filter((item) => item.status === "Active").length,
    inactive: classes.filter((item) => item.status === "Inactive").length,
    archived: classes.filter(
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

/**
 * Map express-validator / API field errors onto form keys when present.
 */
export function getApiFieldErrors(error) {
  const data = error?.response?.data;
  const fieldErrors = {};
  if (!data) return fieldErrors;

  const list = Array.isArray(data.errors)
    ? data.errors
    : data.errors && typeof data.errors === "object"
      ? Object.entries(data.errors).flatMap(([path, msgs]) =>
          (Array.isArray(msgs) ? msgs : [msgs]).map((msg) => ({
            path,
            msg: typeof msg === "string" ? msg : msg?.msg || msg?.message,
          }))
        )
      : [];

  for (const item of list) {
    const path = item?.path || item?.param || item?.field;
    const msg =
      typeof item === "string"
        ? item
        : item?.msg || item?.message || null;
    if (path && msg) {
      fieldErrors[path] = msg;
    }
  }

  return fieldErrors;
}

export function validateClassForm(form) {
  const errors = {};

  if (!form.classCode?.trim()) errors.classCode = "Class code is required.";
  if (!form.className?.trim()) errors.className = "Class name is required.";
  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }

  const capacity = parseInt(form.capacity, 10);
  if (!form.capacity && form.capacity !== 0) {
    errors.capacity = "Capacity is required.";
  } else if (Number.isNaN(capacity) || capacity <= 0) {
    errors.capacity = "Capacity must be greater than 0.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
