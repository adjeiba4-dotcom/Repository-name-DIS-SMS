/**
 * Map backend examination shapes to the workspace UI model.
 */

export const EXAMINATION_TYPE_OPTIONS = [
  { value: "MID_TERM", label: "Mid-Term" },
  { value: "END_OF_TERM", label: "End of Term" },
  { value: "MOCK", label: "Mock" },
  { value: "FINAL", label: "Final" },
  { value: "ENTRANCE", label: "Entrance" },
];

export const EXAMINATION_STATUS_OPTIONS = ["Active", "Inactive"];

export const SUMMARY_SCOPE_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "class", label: "Class" },
  { value: "subject", label: "Subject" },
  { value: "teacher", label: "Teacher" },
  { value: "type", label: "Type" },
  { value: "student", label: "Student" },
];

const STATUS_TO_API = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
};

const STATUS_FROM_API = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

const TYPE_LABELS = Object.fromEntries(
  EXAMINATION_TYPE_OPTIONS.map((item) => [item.value, item.label])
);

export function formatExaminationType(type) {
  if (!type) return "—";
  return TYPE_LABELS[type] || String(type).replace(/_/g, " ");
}

export function formatExaminationStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
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

export function formatTeacherName(teacher = {}) {
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  if (name && teacher.staffNo) return `${name} (${teacher.staffNo})`;
  return name || teacher.staffNo || "—";
}

export function formatStudentName(student = {}) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ");
  if (name && student.admissionNo) return `${name} (${student.admissionNo})`;
  return name || student.admissionNo || "—";
}

export function mapExaminationToRow(examination) {
  const schoolClass = examination.schoolClass || {};
  const subject = examination.subject || {};
  const teacher = examination.teacher || {};
  const academicYear = examination.academicYear || {};
  const term = examination.term || {};

  return {
    id: String(examination.id),
    name: examination.name || formatExaminationType(examination.examinationType),
    academicYearId: examination.academicYearId
      ? String(examination.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: examination.termId ? String(examination.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    classId: examination.classId ? String(examination.classId) : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    classLabel: formatClassLabel(schoolClass),
    subjectId: examination.subjectId ? String(examination.subjectId) : "",
    subjectName: subject.subjectName ?? "",
    subjectCode: subject.subjectCode ?? "",
    subjectLabel: formatSubjectLabel(subject),
    teacherId: examination.teacherId ? String(examination.teacherId) : "",
    teacherName: formatTeacherName(teacher),
    examinationType: examination.examinationType ?? "",
    examinationTypeLabel: formatExaminationType(examination.examinationType),
    maxMarks: Number(examination.maxMarks ?? 0),
    passingMarks: Number(examination.passingMarks ?? 0),
    examinationDate: toDateInputValue(examination.examinationDate),
    examinationDateLabel: formatDisplayDate(examination.examinationDate),
    durationMinutes: examination.durationMinutes ?? null,
    durationLabel:
      examination.durationMinutes != null
        ? `${examination.durationMinutes} min`
        : "—",
    isLocked: Boolean(examination.isLocked),
    isLockedLabel: examination.isLocked ? "Yes" : "No",
    remarks: examination.remarks ?? "",
    status: formatExaminationStatus(examination.status),
    statusApi: examination.status ?? "",
    scoreCount: examination.scoreCount ?? examination._count?.scores ?? 0,
    createdAt: examination.createdAt ?? "",
    updatedAt: examination.updatedAt ?? "",
  };
}

export function mapExaminationToForm(examination) {
  if (!examination) return null;

  return {
    name: examination.name ?? "",
    academicYearId: examination.academicYearId
      ? String(examination.academicYearId)
      : "",
    termId: examination.termId ? String(examination.termId) : "",
    classId: examination.classId ? String(examination.classId) : "",
    subjectId: examination.subjectId ? String(examination.subjectId) : "",
    teacherId: examination.teacherId ? String(examination.teacherId) : "",
    examinationType: examination.examinationType || "MID_TERM",
    maxMarks: String(examination.maxMarks ?? ""),
    passingMarks: String(examination.passingMarks ?? ""),
    examinationDate: toDateInputValue(examination.examinationDate),
    durationMinutes:
      examination.durationMinutes == null ? "" : String(examination.durationMinutes),
    remarks: examination.remarks ?? "",
    status: formatExaminationStatus(examination.status) || "Active",
  };
}

export function buildExaminationPayload(form) {
  return {
    name: form.name?.trim() || null,
    academicYearId: parseInt(form.academicYearId, 10),
    termId: parseInt(form.termId, 10),
    classId: parseInt(form.classId, 10),
    subjectId: parseInt(form.subjectId, 10),
    teacherId: parseInt(form.teacherId, 10),
    examinationType: String(form.examinationType).toUpperCase(),
    maxMarks: Number(form.maxMarks),
    passingMarks: Number(form.passingMarks),
    examinationDate: form.examinationDate,
    durationMinutes:
      form.durationMinutes === "" || form.durationMinutes == null
        ? null
        : Number(form.durationMinutes),
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function getScorePassFail(marks, passingMarks) {
  if (marks === "" || marks == null) return "";
  const numericMarks = Number(marks);
  const passThreshold = Number(passingMarks);
  if (Number.isNaN(numericMarks) || Number.isNaN(passThreshold)) return "";
  return numericMarks >= passThreshold ? "Pass" : "Fail";
}

export function mapRosterStudentToRow(student, examination = {}) {
  const score = student.score || null;
  const passingMarks = Number(examination.passingMarks ?? 0);
  const marks = score ? String(score.marks) : "";
  return {
    id: score?.id ? String(score.id) : `draft-${student.studentId}`,
    scoreId: score?.id ? String(score.id) : "",
    studentId: String(student.studentId),
    admissionNo: student.admissionNo ?? "",
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    studentName: formatStudentName(student),
    marks,
    percentage: score?.percentage ?? null,
    passFail: getScorePassFail(marks, passingMarks),
    remarks: score?.remarks ?? "",
    marked: Boolean(score),
    maxMarks: Number(examination.maxMarks ?? 0),
    passingMarks,
  };
}

export function buildExaminationTimeline(examination) {
  if (!examination) return [];

  const events = [];
  const label =
    examination.name || formatExaminationType(examination.examinationType);

  if (examination.createdAt) {
    events.push({
      id: "created",
      title: "Examination created",
      description: `${label} created for ${formatClassLabel(examination.schoolClass)}.`,
      timestamp: formatDisplayDateTime(examination.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (examination.updatedAt && examination.updatedAt !== examination.createdAt) {
    events.push({
      id: "updated",
      title: "Examination updated",
      description: "Examination details or scores were modified.",
      timestamp: formatDisplayDateTime(examination.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (examination.isLocked && examination.lockedAt) {
    events.push({
      id: "locked",
      title: "Examination locked",
      description: "Score entry and edits were restricted.",
      timestamp: formatDisplayDateTime(examination.lockedAt),
      status: "INACTIVE",
      statusLabel: "Locked",
    });
  }

  return events.sort((a, b) => {
    const left = new Date(a.timestamp).getTime() || 0;
    const right = new Date(b.timestamp).getTime() || 0;
    return right - left;
  });
}

export function getExaminationStatsFromRows(rows = []) {
  const types = new Set(rows.map((row) => row.examinationType).filter(Boolean));
  const classes = new Set(rows.map((row) => row.classId).filter(Boolean));
  const subjects = new Set(rows.map((row) => row.subjectId).filter(Boolean));
  const scoreCount = rows.reduce(
    (sum, row) => sum + Number(row.scoreCount || 0),
    0
  );

  return {
    total: rows.length,
    types: types.size,
    classes: classes.size,
    subjects: subjects.size,
    scores: scoreCount,
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

export function validateExaminationForm(form) {
  const errors = {};

  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) errors.classId = "Class is required.";
  if (!form.subjectId) errors.subjectId = "Subject is required.";
  if (!form.teacherId) errors.teacherId = "Teacher is required.";
  if (!form.examinationType) {
    errors.examinationType = "Examination type is required.";
  }
  if (!form.examinationDate) {
    errors.examinationDate = "Examination date is required.";
  }

  const maxMarks = Number(form.maxMarks);
  if (form.maxMarks === "" || form.maxMarks == null) {
    errors.maxMarks = "Maximum marks are required.";
  } else if (Number.isNaN(maxMarks) || maxMarks <= 0) {
    errors.maxMarks = "Maximum marks must be greater than zero.";
  }
  const passingMarks = Number(form.passingMarks);
  if (form.passingMarks === "" || form.passingMarks == null) {
    errors.passingMarks = "Passing marks are required.";
  } else if (Number.isNaN(passingMarks) || passingMarks < 0) {
    errors.passingMarks = "Passing marks cannot be negative.";
  } else if (!Number.isNaN(maxMarks) && passingMarks > maxMarks) {
    errors.passingMarks = "Passing marks cannot exceed maximum marks.";
  }
  if (
    form.durationMinutes !== "" &&
    form.durationMinutes != null &&
    (!Number.isInteger(Number(form.durationMinutes)) ||
      Number(form.durationMinutes) <= 0)
  ) {
    errors.durationMinutes = "Duration must be a positive whole number.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
