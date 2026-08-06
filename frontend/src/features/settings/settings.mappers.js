export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function mapSchoolToForm(school = {}) {
  return {
    schoolName: school.schoolName || "",
    schoolCode: school.schoolCode || "",
    motto: school.motto || "",
    address: school.address || "",
    city: school.city || "",
    region: school.region || "",
    country: school.country || "",
    postalCode: school.postalCode || "",
    phone: school.phone || "",
    email: school.email || "",
    website: school.website || "",
    logoUrl: school.logoUrl || "",
    stampUrl: school.stampUrl || "",
    establishedYear: school.establishedYear != null ? String(school.establishedYear) : "",
    accreditationInfo: school.accreditationInfo || "",
  };
}

export function buildSchoolPayload(form = {}) {
  return {
    schoolName: form.schoolName?.trim() || "",
    schoolCode: form.schoolCode?.trim() || null,
    motto: form.motto?.trim() || null,
    address: form.address?.trim() || null,
    city: form.city?.trim() || null,
    region: form.region?.trim() || null,
    country: form.country?.trim() || null,
    postalCode: form.postalCode?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    website: form.website?.trim() || null,
    logoUrl: form.logoUrl?.trim() || null,
    stampUrl: form.stampUrl?.trim() || null,
    establishedYear: form.establishedYear
      ? Number(form.establishedYear)
      : null,
    accreditationInfo: form.accreditationInfo?.trim() || null,
  };
}

export function validateSchoolForm(form = {}) {
  const errors = {};
  if (!form.schoolName?.trim()) {
    errors.schoolName = "School name is required.";
  }
  if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (form.establishedYear) {
    const year = Number(form.establishedYear);
    if (!Number.isInteger(year) || year < 1800 || year > 2200) {
      errors.establishedYear = "Enter a valid year between 1800 and 2200.";
    }
  }
  return errors;
}

export function mapAuditToRow(item = {}) {
  const userName = item.user
    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(" ") ||
      item.user.email
    : "—";

  return {
    id: item.id,
    module: item.module || "—",
    action: item.action || "—",
    entityType: item.entityType || "—",
    recordId: item.recordId ?? "—",
    userName,
    description: item.description || "—",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "—",
  };
}

export function mapNotificationToRow(item = {}) {
  return {
    id: item.id,
    title: item.title || "—",
    type: item.type || "INFO",
    channel: item.channel || "IN_APP",
    isRead: item.isRead ? "Read" : "Unread",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "—",
    raw: item,
  };
}

export const CONFIG_FIELD_META = {
  "app.currency": { label: "Currency code", group: "Localization" },
  "app.currency_symbol": { label: "Currency symbol", group: "Localization" },
  "app.date_format": { label: "Date format", group: "Localization" },
  "app.time_format": { label: "Time format", group: "Localization" },
  "app.timezone": { label: "Timezone", group: "Localization" },
  "app.pagination_default": { label: "Default page size", group: "Pagination" },
  "app.pagination_max": { label: "Maximum page size", group: "Pagination" },
  "academic.default_term_count": {
    label: "Default term count",
    group: "Academic",
  },
  "academic.grading_scale": { label: "Grading scale", group: "Academic" },
  "academic.ca_weight": {
    label: "CA weight (%)",
    group: "Academic",
  },
  "academic.exam_weight": {
    label: "Exam weight (%)",
    group: "Academic",
  },
  "academic.pass_mark": {
    label: "Pass mark (%)",
    group: "Academic",
  },
  "app.school_year_label": { label: "Academic year label", group: "General" },
};
