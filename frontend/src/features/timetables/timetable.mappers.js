/**
 * Map backend timetable shapes to the workspace UI model.
 */

export const TIMETABLE_STATUS_OPTIONS = ["Active", "Inactive"];

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export const WEEKDAY_COLUMNS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
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

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function formatTimetableStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function formatDayOfWeek(day) {
  if (!day) return "—";
  const key = String(day).toUpperCase();
  return DAY_LABELS[key] ?? day;
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

export function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return "—";
  return `${startTime || "—"} – ${endTime || "—"}`;
}

export function mapTimetableToRow(entry) {
  const schoolClass = entry.schoolClass || {};
  const subject = entry.subject || {};
  const teacher = entry.teacher || {};
  const academicYear = entry.academicYear || {};
  const term = entry.term || {};

  return {
    id: String(entry.id),
    academicYearId: entry.academicYearId ? String(entry.academicYearId) : "",
    academicYearName: academicYear.name ?? "",
    termId: entry.termId ? String(entry.termId) : "",
    termName: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : "",
    classId: entry.classId ? String(entry.classId) : "",
    className: schoolClass.className ?? "",
    classCode: schoolClass.classCode ?? "",
    classLabel: formatClassLabel(schoolClass),
    subjectId: entry.subjectId ? String(entry.subjectId) : "",
    subjectName: subject.subjectName ?? "",
    subjectCode: subject.subjectCode ?? "",
    subjectLabel: formatSubjectLabel(subject),
    teacherId: entry.teacherId ? String(entry.teacherId) : "",
    teacherName: formatTeacherName(teacher),
    dayOfWeek: entry.dayOfWeek ? String(entry.dayOfWeek).toUpperCase() : "",
    dayLabel: formatDayOfWeek(entry.dayOfWeek),
    startTime: entry.startTime ?? "",
    endTime: entry.endTime ?? "",
    timeRange: formatTimeRange(entry.startTime, entry.endTime),
    room: entry.room ?? "",
    remarks: entry.remarks ?? "",
    status: formatTimetableStatus(entry.status),
    createdAt: entry.createdAt ?? "",
    updatedAt: entry.updatedAt ?? "",
  };
}

export function mapTimetableToForm(entry) {
  if (!entry) return null;

  return {
    academicYearId: entry.academicYearId ? String(entry.academicYearId) : "",
    termId: entry.termId ? String(entry.termId) : "",
    classId: entry.classId ? String(entry.classId) : "",
    classSubjectId: "",
    subjectId: entry.subjectId ? String(entry.subjectId) : "",
    teacherId: entry.teacherId ? String(entry.teacherId) : "",
    dayOfWeek: entry.dayOfWeek
      ? String(entry.dayOfWeek).toUpperCase()
      : "MONDAY",
    startTime: entry.startTime ?? "",
    endTime: entry.endTime ?? "",
    room: entry.room ?? "",
    remarks: entry.remarks ?? "",
    status: formatTimetableStatus(entry.status) || "Active",
  };
}

function normalizeTime(value = "") {
  const trimmed = String(value).trim();
  // Browsers may return HH:mm:ss from <input type="time">.
  const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)/);
  return match ? `${match[1]}:${match[2]}` : trimmed;
}

export function buildTimetablePayload(form) {
  return {
    academicYearId: parseInt(form.academicYearId, 10),
    termId: parseInt(form.termId, 10),
    classId: parseInt(form.classId, 10),
    subjectId: parseInt(form.subjectId, 10),
    teacherId: parseInt(form.teacherId, 10),
    dayOfWeek: String(form.dayOfWeek).toUpperCase(),
    startTime: normalizeTime(form.startTime),
    endTime: normalizeTime(form.endTime),
    room: form.room?.trim() || null,
    remarks: form.remarks?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildTimetableTimeline(entry) {
  if (!entry) return [];

  const events = [];
  const label = `${formatClassLabel(entry.schoolClass)} · ${formatSubjectLabel(entry.subject)}`;

  if (entry.createdAt) {
    events.push({
      id: "created",
      title: "Slot created",
      description: `${label} scheduled.`,
      timestamp: formatDisplayDateTime(entry.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (entry.updatedAt && entry.updatedAt !== entry.createdAt) {
    events.push({
      id: "updated",
      title: "Slot updated",
      description: "Timetable details were modified.",
      timestamp: formatDisplayDateTime(entry.updatedAt),
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

export function getTimetableStats(entries = []) {
  const uniqueClasses = new Set(
    entries.map((item) => item.classId).filter(Boolean)
  );
  const uniqueTeachers = new Set(
    entries.map((item) => item.teacherId).filter(Boolean)
  );
  const uniqueSubjects = new Set(
    entries.map((item) => item.subjectId).filter(Boolean)
  );

  return {
    total: entries.length,
    active: entries.filter((item) => item.status === "Active").length,
    inactive: entries.filter((item) => item.status === "Inactive").length,
    classes: uniqueClasses.size,
    teachers: uniqueTeachers.size,
    subjects: uniqueSubjects.size,
  };
}

/**
 * Build week-grid rows keyed by start–end time bands.
 */
export function buildWeekGrid(entries = [], days = WEEKDAY_COLUMNS) {
  const mapped = entries.map(mapTimetableToRow);
  const timeKeys = [
    ...new Set(mapped.map((row) => `${row.startTime}|${row.endTime}`)),
  ].sort((a, b) => {
    const [aStart] = a.split("|");
    const [bStart] = b.split("|");
    return aStart.localeCompare(bStart);
  });

  return timeKeys.map((key) => {
    const [startTime, endTime] = key.split("|");
    const cells = {};
    for (const day of days) {
      cells[day] = mapped.filter(
        (row) =>
          row.dayOfWeek === day &&
          row.startTime === startTime &&
          row.endTime === endTime
      );
    }
    return {
      key,
      startTime,
      endTime,
      timeLabel: formatTimeRange(startTime, endTime),
      cells,
    };
  });
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

export function validateTimetableForm(form) {
  const errors = {};

  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.termId) errors.termId = "Term is required.";
  if (!form.classId) errors.classId = "Class is required.";
  if (!form.subjectId) errors.subjectId = "Subject is required.";
  if (!form.teacherId) errors.teacherId = "Teacher is required.";

  if (!form.dayOfWeek) {
    errors.dayOfWeek = "Day of week is required.";
  } else if (!DAYS_OF_WEEK.includes(String(form.dayOfWeek).toUpperCase())) {
    errors.dayOfWeek = "Select a valid day of week.";
  }

  const startTime = normalizeTime(form.startTime);
  const endTime = normalizeTime(form.endTime);

  if (!form.startTime) {
    errors.startTime = "Start time is required.";
  } else if (!TIME_PATTERN.test(startTime)) {
    errors.startTime = "Use HH:mm 24-hour format.";
  }

  if (!form.endTime) {
    errors.endTime = "End time is required.";
  } else if (!TIME_PATTERN.test(endTime)) {
    errors.endTime = "Use HH:mm 24-hour format.";
  }

  if (
    startTime &&
    endTime &&
    TIME_PATTERN.test(startTime) &&
    TIME_PATTERN.test(endTime) &&
    startTime >= endTime
  ) {
    errors.endTime = "End time must be later than start time.";
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
