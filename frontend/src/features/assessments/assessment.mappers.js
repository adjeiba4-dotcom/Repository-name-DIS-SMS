/**
 * Map backend assessment shapes to the workspace UI model.
 */

export const ASSESSMENT_TYPE_OPTIONS = [
  { value: "CLASS_WORK", label: "Class Work" },
  { value: "HOMEWORK", label: "Homework" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "PRACTICAL", label: "Practical" },
  { value: "PROJECT", label: "Project" },
  { value: "ORAL_TEST", label: "Oral Test" },
  { value: "MID_TERM", label: "Mid-Term" },
  { value: "CONTINUOUS_ASSESSMENT", label: "Continuous Assessment" },
];

export const ASSESSMENT_STATUS_OPTIONS = ["Active", "Inactive"];

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
  ASSESSMENT_TYPE_OPTIONS.map((item) => [item.value, item.label])
);

export function formatAssessmentType(type) {
  if (!type) return "—";
  return TYPE_LABELS[type] || String(type).replace(/_/g, " ");
}

export function formatAssessmentStatus(status) {
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

export function mapAssessmentToRow(assessment) {
  const schoolClass = assessment.schoolClass || {};
  const subject = assessment.subject || {};
  const teacher = assessment.teacher || {};
  const academicYear = assessment.academicYear || {};
  const term = assessment.term || {};

  return {
    id: String(assessment.id),
    title: assessment.title || formatAssessmentType(assessment.assessmentType),
    academicYearId: assessment.academicYearId
      ? String(assessment.academicYearId)
      : "",
    academicYearName: academicYear.name ?? "",
    termId: assessment.termId ? String(assessment.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    classId: assessment.classId ? String(assessment.classId) : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    classLabel: formatClassLabel(schoolClass),
    subjectId: assessment.subjectId ? String(assessment.subjectId) : "",
    subjectName: subject.subjectName ?? "",
    subjectCode: subject.subjectCode ?? "",
    subjectLabel: formatSubjectLabel(subject),
    teacherId: assessment.teacherId ? String(assessment.teacherId) : "",
    teacherName: formatTeacherName(teacher),
    assessmentType: assessment.assessmentType ?? "",
    assessmentTypeLabel: formatAssessmentType(assessment.assessmentType),
    maxMarks: Number(assessment.maxMarks ?? 0),
    assessmentDate: toDateInputValue(assessment.assessmentDate),
    assessmentDateLabel: formatDisplayDate(assessment.assessmentDate),
    remarks: assessment.remarks ?? "",
    status: formatAssessmentStatus(assessment.status),
    statusApi: assessment.status ?? "",
    scoreCount: assessment.scoreCount ?? assessment._count?.scores ?? 0,
    createdAt: assessment.createdAt ?? "",
    updatedAt: assessment.updatedAt ?? "",
  };
}

export function mapAssessmentToForm(assessment) {
  if (!assessment) return null;

  return {
    title: assessment.title ?? "",
    academicYearId: assessment.academicYearId
      ? String(assessment.academicYearId)
      : "",
    termId: assessment.termId ? String(assessment.termId) : "",
    classId: assessment.classId ? String(assessment.classId) : "",
    subjectId: assessment.subjectId ? String(assessment.subjectId) : "",
    teacherId: assessment.teacherId ? String(assessment.teacherId) : "",
    assessmentType: assessment.assessmentType || "CLASS_WORK",
    maxMarks: String(assessment.maxMarks ?? ""),
    assessmentDate: toDateInputValue(assessment.assessmentDate),
    remarks: assessment.remarks ?? "",
    status: formatAssessmentStatus(assessment.status) || "Active",
  };
}

export function buildAssessmentPayload(form) {
  return {
    title: form.title?.trim() || null,
    academicYearId: parseInt(form.academicYearId, 10),
    termId: parseInt(form.termId, 10),
    classId: parseInt(form.classId, 10),
    subjectId: parseInt(form.subjectId, 10),
    teacherId: parseInt(form.teacherId, 10),
    assessmentType: String(form.assessmentType).toUpperCase(),
    maxMarks: Number(form.maxMarks),
    assessmentDate: form.assessmentDate,
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function mapRosterStudentToRow(student, assessment = {}) {
  const score = student.score || null;
  return {
    id: score?.id ? String(score.id) : `draft-${student.studentId}`,
    scoreId: score?.id ? String(score.id) : "",
    studentId: String(student.studentId),
    admissionNo: student.admissionNo ?? "",
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    studentName: formatStudentName(student),
    marks: score ? String(score.marks) : "",
    percentage: score?.percentage ?? null,
    remarks: score?.remarks ?? "",
    marked: Boolean(score),
    maxMarks: Number(assessment.maxMarks ?? 0),
  };
}

export function buildAssessmentTimeline(assessment) {
  if (!assessment) return [];

  const events = [];
  const label =
    assessment.title || formatAssessmentType(assessment.assessmentType);

  if (assessment.createdAt) {
    events.push({
      id: "created",
      title: "Assessment created",
      description: `${label} created for ${formatClassLabel(assessment.schoolClass)}.`,
      timestamp: formatDisplayDateTime(assessment.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (assessment.updatedAt && assessment.updatedAt !== assessment.createdAt) {
    events.push({
      id: "updated",
      title: "Assessment updated",
      description: "Assessment details or scores were modified.",
      timestamp: formatDisplayDateTime(assessment.updatedAt),
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

export function getAssessmentStatsFromRows(rows = []) {
  const types = new Set(rows.map((row) => row.assessmentType).filter(Boolean));
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

export function validateAssessmentForm(form) {
  const errors = {};

  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) errors.classId = "Class is required.";
  if (!form.subjectId) errors.subjectId = "Subject is required.";
  if (!form.teacherId) errors.teacherId = "Teacher is required.";
  if (!form.assessmentType) {
    errors.assessmentType = "Assessment type is required.";
  }
  if (!form.assessmentDate) {
    errors.assessmentDate = "Assessment date is required.";
  }

  const maxMarks = Number(form.maxMarks);
  if (form.maxMarks === "" || form.maxMarks == null) {
    errors.maxMarks = "Maximum marks are required.";
  } else if (Number.isNaN(maxMarks) || maxMarks <= 0) {
    errors.maxMarks = "Maximum marks must be greater than zero.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
