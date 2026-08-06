/**
 * Map backend department shapes to the Departments workspace UI model.
 */

export const DEPARTMENT_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatDepartmentStatus(status) {
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

function relationCount(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return 0;
}

export function mapDepartmentToRow(department) {
  return {
    id: String(department.id),
    code: department.code ?? "",
    name: department.name ?? "",
    description: department.description ?? "",
    status: formatDepartmentStatus(department.status),
    teacherCount: relationCount(department.teachers),
    subjectCount: relationCount(department.subjects),
    employeeCount: relationCount(department.employees),
    stockIssueCount: relationCount(department.stockIssues),
    createdAt: department.createdAt ?? "",
    updatedAt: department.updatedAt ?? "",
    deletedAt: department.deletedAt ?? "",
  };
}

export function mapDepartmentToForm(department) {
  if (!department) return null;

  return {
    code: department.code ?? "",
    name: department.name ?? "",
    description: department.description ?? "",
    status: formatDepartmentStatus(department.status) || "Active",
  };
}

export function buildDepartmentPayload(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description?.trim() || null,
    status: toApiStatus(form.status),
  };
}

export function buildDepartmentTimeline(department) {
  if (!department) return [];

  const events = [];

  if (department.createdAt) {
    events.push({
      id: "created",
      title: "Department created",
      description: `${department.name} (${department.code}) registered.`,
      timestamp: formatDisplayDateTime(department.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (
    department.updatedAt &&
    department.updatedAt !== department.createdAt
  ) {
    events.push({
      id: "updated",
      title: "Details updated",
      description: "Department details were modified.",
      timestamp: formatDisplayDateTime(department.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (department.deletedAt) {
    events.push({
      id: "archived",
      title: "Department archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(department.deletedAt),
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

export function getDepartmentStats(departments = []) {
  return {
    total: departments.length,
    active: departments.filter((item) => item.status === "Active").length,
    inactive: departments.filter((item) => item.status === "Inactive").length,
    archived: departments.filter(
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
 * Detect ARCHIVED_DUPLICATE conflicts so the form can offer restore.
 */
export function getArchivedDuplicateConflict(error) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return null;

  const hit = errors.find(
    (item) =>
      item &&
      typeof item === "object" &&
      item.code === "ARCHIVED_DUPLICATE" &&
      item.archivedId != null
  );

  return hit
    ? {
        archivedId: String(hit.archivedId),
        field: hit.field || null,
        departmentCode: hit.departmentCode || "",
        departmentName: hit.departmentName || "",
        message: getApiErrorMessage(
          error,
          "An archived department already exists. Restore it instead."
        ),
      }
    : null;
}

export function validateDepartmentForm(form) {
  const errors = {};

  if (!form.code?.trim()) {
    errors.code = "Department code is required.";
  } else if (form.code.trim().length > 20) {
    errors.code = "Department code must not exceed 20 characters.";
  }

  if (!form.name?.trim()) {
    errors.name = "Department name is required.";
  } else if (form.name.trim().length > 100) {
    errors.name = "Department name must not exceed 100 characters.";
  }

  if (form.description?.trim() && form.description.trim().length > 255) {
    errors.description = "Description must not exceed 255 characters.";
  }

  if (!form.status) {
    errors.status = "Status is required.";
  }

  return errors;
}
