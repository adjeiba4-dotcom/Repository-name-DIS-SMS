/**
 * Map backend teacher / department shapes to the Teachers workspace UI model.
 */

export const TEACHER_STATUS_OPTIONS = ["Active", "Inactive"];

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

export function formatTeacherStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function formatTeacherGender(gender) {
  return GENDER_FROM_API[gender] ?? gender ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function toApiGender(gender) {
  return GENDER_TO_API[gender] ?? null;
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function mapTeacherToRow(teacher) {
  return {
    id: String(teacher.id),
    staffNo: teacher.staffNo ?? "",
    name: [teacher.firstName, teacher.lastName].filter(Boolean).join(" "),
    email: teacher.email ?? "",
    department: teacher.department?.name ?? "—",
    departmentId: teacher.departmentId ?? teacher.department?.id ?? null,
    gender: formatTeacherGender(teacher.gender),
    status: formatTeacherStatus(teacher.status),
    phone: teacher.phone ?? "",
    qualification: teacher.qualification ?? "",
    employmentDate: teacher.employmentDate ?? "",
    photoUrl: teacher.photoUrl || teacher.avatarUrl || "",
    avatarUrl: teacher.avatarUrl || teacher.photoUrl || "",
  };
}

/**
 * Map API teacher detail into the registration/edit form shape.
 */
export function mapTeacherToForm(teacher) {
  if (!teacher) {
    return null;
  }

  return {
    firstName: teacher.firstName ?? "",
    lastName: teacher.lastName ?? "",
    otherNames: "",
    gender: formatTeacherGender(teacher.gender),
    dateOfBirth: "",
    nationality: "Ghanaian",
    staffNo: teacher.staffNo ?? "",
    departmentId:
      teacher.departmentId != null
        ? String(teacher.departmentId)
        : teacher.department?.id != null
          ? String(teacher.department.id)
          : "",
    employmentDate: toDateInputValue(teacher.employmentDate),
    status: formatTeacherStatus(teacher.status) || "Active",
    employmentType: "Full-time",
    jobTitle: "Teacher",
    qualification: teacher.qualification ?? "",
    specialization: "",
    institution: "",
    yearObtained: "",
    phone: teacher.phone ?? "",
    email: teacher.email ?? "",
    address: teacher.address ?? "",
    city: "",
    region: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    bankBranch: "",
  };
}

export function mapDepartmentToOption(department) {
  return {
    value: String(department.id),
    name: department.name ?? "",
    label: department.name
      ? `${department.name}${department.code ? ` (${department.code})` : ""}`
      : `Department #${department.id}`,
  };
}

/**
 * Build API payload from the registration form (UI-only fields omitted).
 */
export function buildTeacherPayload(form) {
  const payload = {
    staffNo: form.staffNo.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    gender: toApiGender(form.gender),
    departmentId: Number(form.departmentId),
    status: toApiStatus(form.status),
  };

  if (form.employmentDate) {
    payload.employmentDate = form.employmentDate;
  }
  if (form.qualification?.trim()) {
    payload.qualification = form.qualification.trim();
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
