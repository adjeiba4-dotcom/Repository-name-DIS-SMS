/**
 * Map backend term shapes to the Terms workspace UI model.
 */

export const TERM_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatTermStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
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
    return String(value).slice(0, 10);
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

export function mapTermToRow(term) {
  const counts = term._count || {};
  const academicYear = term.academicYear || {};

  return {
    id: String(term.id),
    academicYearId: String(term.academicYearId ?? academicYear.id ?? ""),
    academicYearName: academicYear.name ?? "",
    code: term.code ?? "",
    name: term.name ?? "",
    description: term.description ?? "",
    startDate: term.startDate ?? "",
    endDate: term.endDate ?? "",
    startDateLabel: formatDisplayDate(term.startDate),
    endDateLabel: formatDisplayDate(term.endDate),
    status: formatTermStatus(term.status),
    isCurrent: Boolean(term.isCurrent),
    attendanceCount: counts.attendance ?? 0,
    examinationCount: counts.examinations ?? 0,
    resultCount: counts.results ?? 0,
    timetableCount: counts.timetables ?? 0,
    createdAt: term.createdAt ?? "",
    updatedAt: term.updatedAt ?? "",
    deletedAt: term.deletedAt ?? "",
  };
}

export function mapTermToForm(term) {
  if (!term) return null;

  return {
    academicYearId: String(term.academicYearId ?? term.academicYear?.id ?? ""),
    code: term.code ?? "",
    name: term.name ?? "",
    description: term.description ?? "",
    startDate: toDateInputValue(term.startDate),
    endDate: toDateInputValue(term.endDate),
    status: formatTermStatus(term.status) || "Active",
  };
}

export function buildTermPayload(form) {
  return {
    academicYearId: parseInt(form.academicYearId, 10),
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description?.trim() || null,
    startDate: form.startDate,
    endDate: form.endDate,
    status: toApiStatus(form.status),
  };
}

export function buildTermTimeline(term) {
  if (!term) return [];

  const events = [];

  if (term.createdAt) {
    events.push({
      id: "created",
      title: "Term created",
      description: `${term.name} (${term.code}) registered.`,
      timestamp: formatDisplayDateTime(term.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (term.updatedAt && term.updatedAt !== term.createdAt) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Term details were modified.",
      timestamp: formatDisplayDateTime(term.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (term.isCurrent) {
    events.push({
      id: "current",
      title: "Current term",
      description: "This term is marked as the active/current term.",
      timestamp: formatDisplayDateTime(term.updatedAt || term.createdAt),
      status: "ACTIVE",
      statusLabel: "Current",
    });
  }

  if (term.deletedAt) {
    events.push({
      id: "archived",
      title: "Term archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(term.deletedAt),
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

export function getTermStats(terms = []) {
  return {
    total: terms.length,
    active: terms.filter((t) => t.status === "Active").length,
    inactive: terms.filter((t) => t.status === "Inactive").length,
    archived: terms.filter((t) => t.status === "Archived" || t.deletedAt)
      .length,
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

export function validateTermForm(form) {
  const errors = {};

  if (!form.academicYearId) {
    errors.academicYearId = "Academic year is required.";
  }
  if (!form.code?.trim()) errors.code = "Term code is required.";
  if (!form.name?.trim()) errors.name = "Term name is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";

  if (form.startDate && form.endDate) {
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      errors.endDate = "End date must be after start date.";
    }
  }

  if (!form.status) errors.status = "Status is required.";

  return errors;
}
