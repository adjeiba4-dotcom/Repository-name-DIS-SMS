/**
 * Map backend academic year shapes to the Academic Years workspace UI model.
 */

export const ACADEMIC_YEAR_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatAcademicYearStatus(status) {
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

export function mapAcademicYearToRow(year) {
  const counts = year._count || {};
  return {
    id: String(year.id),
    name: year.name ?? "",
    startDate: year.startDate ?? "",
    endDate: year.endDate ?? "",
    startDateLabel: formatDisplayDate(year.startDate),
    endDateLabel: formatDisplayDate(year.endDate),
    status: formatAcademicYearStatus(year.status),
    isCurrent: Boolean(year.isCurrent),
    termCount: counts.terms ?? year.terms?.length ?? 0,
    enrollmentCount: counts.enrollments ?? 0,
    createdAt: year.createdAt ?? "",
    updatedAt: year.updatedAt ?? "",
    deletedAt: year.deletedAt ?? "",
  };
}

export function mapAcademicYearToForm(year) {
  if (!year) return null;

  return {
    name: year.name ?? "",
    startDate: toDateInputValue(year.startDate),
    endDate: toDateInputValue(year.endDate),
    status: formatAcademicYearStatus(year.status) || "Active",
  };
}

export function buildAcademicYearPayload(form) {
  return {
    name: form.name.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    status: toApiStatus(form.status),
  };
}

export function buildAcademicYearTimeline(year) {
  if (!year) return [];

  const events = [];

  if (year.createdAt) {
    events.push({
      id: "created",
      title: "Academic year created",
      description: `${year.name} registered.`,
      timestamp: formatDisplayDateTime(year.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (year.updatedAt && year.updatedAt !== year.createdAt) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Academic year details were modified.",
      timestamp: formatDisplayDateTime(year.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (year.deletedAt) {
    events.push({
      id: "archived",
      title: "Academic year archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(year.deletedAt),
      status: "ARCHIVED",
      statusLabel: "Archived",
    });
  }

  (year.terms || []).forEach((term) => {
    events.push({
      id: `term-${term.id}`,
      title: `Term: ${term.name}`,
      description: `${formatDisplayDate(term.startDate)} – ${formatDisplayDate(term.endDate)}`,
      timestamp: formatDisplayDateTime(term.startDate),
      status: term.status || "ACTIVE",
      statusLabel: formatAcademicYearStatus(term.status),
    });
  });

  return events.sort((a, b) => {
    const left = new Date(a.timestamp).getTime() || 0;
    const right = new Date(b.timestamp).getTime() || 0;
    return right - left;
  });
}

export function getAcademicYearStats(years = []) {
  return {
    total: years.length,
    active: years.filter((y) => y.status === "Active").length,
    inactive: years.filter((y) => y.status === "Inactive").length,
    archived: years.filter((y) => y.status === "Archived" || y.deletedAt)
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

export function validateAcademicYearForm(form) {
  const errors = {};

  if (!form.name?.trim()) errors.name = "Academic year name is required.";
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
