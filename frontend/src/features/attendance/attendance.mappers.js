/**
 * Map backend attendance shapes to the workspace UI model.
 */

export const ATTENDANCE_STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

export const ATTENDANCE_STATUS_API = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
];

export const ATTENDANCE_STATUS_MAP = {
  PRESENT: "success",
  Present: "success",
  ABSENT: "danger",
  Absent: "danger",
  LATE: "warning",
  Late: "warning",
  EXCUSED: "info",
  Excused: "info",
  Unmarked: "secondary",
};

const STATUS_TO_API = {
  Present: "PRESENT",
  Absent: "ABSENT",
  Late: "LATE",
  Excused: "EXCUSED",
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
};

const STATUS_FROM_API = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export const SUMMARY_SCOPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "class", label: "Class" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
];

export function formatAttendanceStatus(status) {
  if (!status) return "Unmarked";
  return STATUS_FROM_API[status] ?? status;
}

export function toApiAttendanceStatus(status) {
  return STATUS_TO_API[status] ?? null;
}

export function formatDisplayDate(value) {
  if (!value) return "—";
  try {
    const raw = String(value);
    const dateOnly = raw.includes("T") ? raw.slice(0, 10) : raw;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(`${dateOnly}T00:00:00Z`));
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
  if (name && student.admissionNo) return `${name} (${student.admissionNo})`;
  return name || student.admissionNo || "—";
}

export function formatClassLabel(schoolClass = {}) {
  if (!schoolClass) return "—";
  if (schoolClass.className && schoolClass.classCode) {
    return `${schoolClass.className} (${schoolClass.classCode})`;
  }
  return schoolClass.className || schoolClass.classCode || "—";
}

export function formatTeacherName(teacher = {}) {
  if (!teacher) return "—";
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  if (name && teacher.staffNo) return `${name} (${teacher.staffNo})`;
  return name || teacher.staffNo || "—";
}

export function toDateInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") {
    return value.includes("T") ? value.slice(0, 10) : value;
  }
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function mapAttendanceToRow(record) {
  const student = record.student || {};
  const schoolClass = student.schoolClass || {};
  const academicYear = record.academicYear || {};
  const term = record.term || {};

  return {
    id: String(record.id),
    studentId: record.studentId ? String(record.studentId) : "",
    studentName: formatStudentName(student),
    admissionNo: student.admissionNo ?? "",
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    classId: student.classId ? String(student.classId) : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    classLabel: formatClassLabel(schoolClass),
    academicYearId: record.academicYearId
      ? String(record.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: record.termId ? String(record.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    attendanceDate: toDateInputValue(record.attendanceDate),
    attendanceDateLabel: formatDisplayDate(record.attendanceDate),
    status: formatAttendanceStatus(record.status),
    statusApi: record.status ?? "",
    remarks: record.remarks ?? "",
    createdAt: record.createdAt ?? "",
    updatedAt: record.updatedAt ?? "",
  };
}

export function mapRosterStudentToRow(student, context = {}) {
  const attendance = student.attendance || null;
  return {
    id: attendance?.id ? String(attendance.id) : `draft-${student.studentId}`,
    attendanceId: attendance?.id ? String(attendance.id) : "",
    studentId: String(student.studentId),
    enrollmentId: student.enrollmentId
      ? String(student.enrollmentId)
      : "",
    enrollmentNumber: student.enrollmentNumber ?? "",
    admissionNo: student.admissionNo ?? "",
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    studentName: formatStudentName(student),
    classId: context.classId ? String(context.classId) : "",
    classLabel: context.classLabel || "",
    academicYearId: context.academicYearId
      ? String(context.academicYearId)
      : "",
    termId: context.termId ? String(context.termId) : "",
    attendanceDate: context.attendanceDate || "",
    attendanceDateLabel: formatDisplayDate(context.attendanceDate),
    status: attendance
      ? formatAttendanceStatus(attendance.status)
      : "Unmarked",
    statusApi: attendance?.status ?? "",
    remarks: attendance?.remarks ?? "",
    marked: Boolean(attendance),
  };
}

export function mapAttendanceToForm(record) {
  if (!record) return null;

  return {
    studentId: record.studentId ? String(record.studentId) : "",
    academicYearId: record.academicYearId
      ? String(record.academicYearId)
      : "",
    termId: record.termId ? String(record.termId) : "",
    classId: record.student?.classId
      ? String(record.student.classId)
      : record.classId
        ? String(record.classId)
        : "",
    attendanceDate: toDateInputValue(record.attendanceDate),
    status: formatAttendanceStatus(record.status) || "Present",
    remarks: record.remarks ?? "",
  };
}

export function buildAttendancePayload(form) {
  return {
    studentId: parseInt(form.studentId, 10),
    academicYearId: parseInt(form.academicYearId, 10),
    termId: parseInt(form.termId, 10),
    classId: form.classId ? parseInt(form.classId, 10) : undefined,
    attendanceDate: form.attendanceDate,
    status: toApiAttendanceStatus(form.status),
    remarks: form.remarks?.trim() || null,
  };
}

export function buildAttendanceTimeline(record) {
  if (!record) return [];

  const events = [];
  const label = formatStudentName(record.student || {});

  if (record.createdAt) {
    events.push({
      id: "created",
      title: "Attendance recorded",
      description: `${label} marked ${formatAttendanceStatus(record.status)}.`,
      timestamp: formatDisplayDateTime(record.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (record.updatedAt && record.updatedAt !== record.createdAt) {
    events.push({
      id: "updated",
      title: "Attendance updated",
      description: "Attendance details were modified.",
      timestamp: formatDisplayDateTime(record.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  return events.sort((a, b) => {
    const left = new Date(a.timestamp).getTime() || 0;
    const right = new Date(b.timestamp).getTime() || 0;
    return right - left;
  });
}

export function getRosterStats(summary = {}, slots = []) {
  return {
    enrolled: summary.enrolled ?? 0,
    present: summary.PRESENT ?? 0,
    absent: summary.ABSENT ?? 0,
    late: summary.LATE ?? 0,
    excused: summary.EXCUSED ?? 0,
    unmarked: summary.unmarked ?? 0,
    presentRate: summary.presentRate ?? 0,
    periods: slots.length,
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

export function validateAttendanceForm(form) {
  const errors = {};

  if (!form.studentId) errors.studentId = "Student is required.";
  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) errors.classId = "Class is required.";
  if (!form.attendanceDate) {
    errors.attendanceDate = "Attendance date is required.";
  }
  if (!form.status) {
    errors.status = "Status is required.";
  } else if (!toApiAttendanceStatus(form.status)) {
    errors.status = "Select a valid attendance status.";
  }

  return errors;
}
