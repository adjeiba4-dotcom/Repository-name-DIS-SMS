/**
 * Map backend student / class shapes to the Students workspace UI model.
 */

export const STUDENT_STATUS_OPTIONS = ["Active", "Inactive", "Archived"];

export const GENDER_OPTIONS = ["Male", "Female"];

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

const GENDER_TO_API = {
  Male: "MALE",
  Female: "FEMALE",
};

const GENDER_FROM_API = {
  MALE: "Male",
  FEMALE: "Female",
};

export function formatStudentStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function formatStudentGender(gender) {
  return GENDER_FROM_API[gender] ?? gender ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function toApiGender(gender) {
  return GENDER_TO_API[gender] ?? null;
}

export function splitFullName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function mapStudentToRow(student) {
  const guardianName = student?.guardian
    ? [student.guardian.firstName, student.guardian.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return {
    id: String(student.id),
    studentId: student.admissionNo ?? "",
    name: [student.firstName, student.lastName].filter(Boolean).join(" "),
    email: student.email ?? "",
    className:
      student.schoolClass?.name ??
      student.schoolClass?.className ??
      "—",
    classId: student.classId ?? student.schoolClass?.id ?? null,
    gender: formatStudentGender(student.gender),
    status: formatStudentStatus(student.status),
    phone: student.phone ?? "",
    guardian: guardianName,
    admissionDate: student.admissionDate ?? "",
  };
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Map API student detail into the registration/edit form shape.
 */
export function mapStudentToForm(student) {
  const guardianName = student?.guardian
    ? [student.guardian.firstName, student.guardian.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return {
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    otherNames: student.otherName ?? "",
    gender: formatStudentGender(student.gender),
    dateOfBirth: toDateInputValue(student.dateOfBirth),
    nationality: "Ghanaian",
    studentId: student.admissionNo ?? "",
    classId: student.classId != null ? String(student.classId) : "",
    admissionDate: toDateInputValue(student.admissionDate),
    status: formatStudentStatus(student.status) || "Active",
    previousSchool: "",
    guardianId: student.guardianId != null ? String(student.guardianId) : "",
    guardianName,
    relationship: student.guardian?.relationship ?? "",
    guardianPhone: student.guardian?.phone ?? "",
    guardianEmail: student.guardian?.email ?? "",
    guardianOccupation: student.guardian?.occupation ?? "",
    phone: student.phone ?? "",
    email: student.email ?? "",
    address: student.address ?? "",
    city: "",
    region: "",
    digitalAddress: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    emergencyNotes: "",
  };
}

export function mapClassToOption(schoolClass) {
  return {
    value: String(schoolClass.id),
    name: schoolClass.name ?? "",
    label: schoolClass.name
      ? `${schoolClass.name}${schoolClass.code ? ` (${schoolClass.code})` : ""}`
      : `Class #${schoolClass.id}`,
  };
}

/**
 * Build API payloads from the registration form (UI-only fields omitted).
 */
export function buildGuardianPayload(form) {
  const { firstName, lastName } = splitFullName(form.guardianName);
  const payload = {
    firstName,
    lastName,
    relationship: form.relationship,
    phone: form.guardianPhone.trim(),
  };

  if (form.guardianEmail?.trim()) {
    payload.email = form.guardianEmail.trim();
  }
  if (form.guardianOccupation?.trim()) {
    payload.occupation = form.guardianOccupation.trim();
  }
  if (form.address?.trim()) {
    payload.address = form.address.trim();
  }

  return payload;
}

export function buildStudentPayload(form, guardianId) {
  const payload = {
    admissionNo: form.studentId.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    gender: toApiGender(form.gender),
    dateOfBirth: form.dateOfBirth,
    admissionDate: form.admissionDate,
    guardianId: Number(guardianId),
    classId: Number(form.classId),
    status: toApiStatus(form.status),
  };

  if (form.otherNames?.trim()) {
    payload.otherName = form.otherNames.trim();
  }
  if (form.email?.trim()) {
    payload.email = form.email.trim();
  }
  if (form.phone?.trim()) {
    payload.phone = form.phone.trim();
  }
  if (form.address?.trim()) {
    payload.address = form.address.trim();
  }

  return payload;
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
