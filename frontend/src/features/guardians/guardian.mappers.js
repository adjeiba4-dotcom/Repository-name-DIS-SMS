/**
 * Map backend guardian shapes to the Guardians workspace UI model.
 */

export const GUARDIAN_STATUS_OPTIONS = ["Active", "Inactive"];

export const GENDER_OPTIONS = ["Male", "Female"];

export const RELATIONSHIP_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "SPONSOR", label: "Sponsor" },
  { value: "UNCLE", label: "Uncle" },
  { value: "AUNT", label: "Aunt" },
  { value: "BROTHER", label: "Brother" },
  { value: "SISTER", label: "Sister" },
  { value: "GRANDPARENT", label: "Grandparent" },
  { value: "OTHER", label: "Other" },
];

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

const RELATIONSHIP_FROM_API = Object.fromEntries(
  RELATIONSHIP_OPTIONS.map((item) => [item.value, item.label])
);

export function formatGuardianStatus(status) {
  return STATUS_FROM_API[status] ?? status ?? "—";
}

export function formatGuardianGender(gender) {
  return GENDER_FROM_API[gender] ?? gender ?? "—";
}

export function formatRelationship(relationship) {
  return RELATIONSHIP_FROM_API[relationship] ?? relationship ?? "—";
}

export function toApiStatus(status) {
  return STATUS_TO_API[status] ?? "ACTIVE";
}

export function toApiGender(gender) {
  return GENDER_TO_API[gender] ?? null;
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

export function getGuardianFullName(guardian) {
  if (!guardian) return "";
  return [guardian.firstName, guardian.middleName, guardian.lastName]
    .filter(Boolean)
    .join(" ");
}

export function mapGuardianToRow(guardian) {
  return {
    id: String(guardian.id),
    guardianNumber: guardian.guardianNumber ?? "",
    name: getGuardianFullName(guardian),
    firstName: guardian.firstName ?? "",
    middleName: guardian.middleName ?? "",
    lastName: guardian.lastName ?? "",
    gender: formatGuardianGender(guardian.gender),
    status: formatGuardianStatus(guardian.status),
    phone: guardian.phone ?? "",
    alternatePhone: guardian.alternatePhone ?? "",
    email: guardian.email ?? "",
    occupation: guardian.occupation ?? "",
    employer: guardian.employer ?? "",
    nationalId: guardian.nationalId ?? "",
    linkedStudents: guardian.studentGuardians?.length ?? 0,
    photoUrl: guardian.photo || "",
    createdAt: guardian.createdAt ?? "",
    updatedAt: guardian.updatedAt ?? "",
    deletedAt: guardian.deletedAt ?? "",
  };
}

export function mapGuardianToForm(guardian) {
  if (!guardian) return null;

  return {
    firstName: guardian.firstName ?? "",
    middleName: guardian.middleName ?? "",
    lastName: guardian.lastName ?? "",
    gender: formatGuardianGender(guardian.gender),
    dateOfBirth: toDateInputValue(guardian.dateOfBirth),
    nationalId: guardian.nationalId ?? "",
    phone: guardian.phone ?? "",
    alternatePhone: guardian.alternatePhone ?? "",
    email: guardian.email ?? "",
    occupation: guardian.occupation ?? "",
    employer: guardian.employer ?? "",
    residentialAddress: guardian.residentialAddress ?? "",
    digitalAddress: guardian.digitalAddress ?? "",
    notes: guardian.notes ?? "",
    status: formatGuardianStatus(guardian.status) || "Active",
    photo: guardian.photo ?? "",
  };
}

export function buildGuardianPayload(form) {
  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    gender: toApiGender(form.gender),
    phone: form.phone.trim(),
    status: toApiStatus(form.status),
  };

  if (form.middleName?.trim()) payload.middleName = form.middleName.trim();
  if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
  if (form.nationalId?.trim()) payload.nationalId = form.nationalId.trim();
  if (form.alternatePhone?.trim()) {
    payload.alternatePhone = form.alternatePhone.trim();
  }
  if (form.email?.trim()) payload.email = form.email.trim();
  if (form.occupation?.trim()) payload.occupation = form.occupation.trim();
  if (form.employer?.trim()) payload.employer = form.employer.trim();
  if (form.residentialAddress?.trim()) {
    payload.residentialAddress = form.residentialAddress.trim();
  }
  if (form.digitalAddress?.trim()) {
    payload.digitalAddress = form.digitalAddress.trim();
  }
  if (form.notes?.trim()) payload.notes = form.notes.trim();
  if (form.photo?.trim()) payload.photo = form.photo.trim();

  return payload;
}

export function buildLinkPayload(form, guardianId) {
  return {
    guardianId: Number(guardianId),
    relationship: form.relationship,
    isPrimary: Boolean(form.isPrimary),
    emergencyContact: Boolean(form.emergencyContact),
    financialResponsibility: Boolean(form.financialResponsibility),
    canPickup: Boolean(form.canPickup),
    remarks: form.remarks?.trim() || undefined,
  };
}

export function buildGuardianTimeline(guardian) {
  if (!guardian) return [];

  const events = [];

  if (guardian.createdAt) {
    events.push({
      id: "created",
      title: "Guardian registered",
      description: `Record created as ${guardian.guardianNumber || "new guardian"}.`,
      timestamp: formatDisplayDateTime(guardian.createdAt),
      status: "ACTIVE",
      statusLabel: "Created",
    });
  }

  if (guardian.updatedAt && guardian.updatedAt !== guardian.createdAt) {
    events.push({
      id: "updated",
      title: "Profile updated",
      description: "Guardian details were modified.",
      timestamp: formatDisplayDateTime(guardian.updatedAt),
      status: "ACTIVE",
      statusLabel: "Updated",
    });
  }

  if (guardian.deletedAt) {
    events.push({
      id: "archived",
      title: "Guardian archived",
      description: "Record was soft-deleted and moved to archive.",
      timestamp: formatDisplayDateTime(guardian.deletedAt),
      status: "ARCHIVED",
      statusLabel: "Archived",
    });
  }

  (guardian.studentGuardians || []).forEach((link) => {
    const studentName = link.student
      ? [link.student.firstName, link.student.lastName].filter(Boolean).join(" ")
      : `Student #${link.studentId}`;

    events.push({
      id: `link-${link.id}`,
      title: `Linked to ${studentName}`,
      description: `${formatRelationship(link.relationship)}${
        link.isPrimary ? " · Primary" : ""
      }${link.emergencyContact ? " · Emergency" : ""}`,
      timestamp: formatDisplayDateTime(link.createdAt || link.updatedAt),
      status: "ACTIVE",
      statusLabel: formatRelationship(link.relationship),
    });
  });

  return events.sort((a, b) => {
    const left = new Date(a.timestamp).getTime() || 0;
    const right = new Date(b.timestamp).getTime() || 0;
    return right - left;
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

export function validateGuardianForm(form) {
  const errors = {};

  if (!form.firstName?.trim()) errors.firstName = "First name is required.";
  if (!form.lastName?.trim()) errors.lastName = "Last name is required.";
  if (!form.gender) errors.gender = "Gender is required.";
  if (!form.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (form.phone.trim().length < 8 || form.phone.trim().length > 30) {
    errors.phone = "Phone number must be between 8 and 30 characters.";
  }

  if (
    form.alternatePhone?.trim() &&
    (form.alternatePhone.trim().length < 8 ||
      form.alternatePhone.trim().length > 30)
  ) {
    errors.alternatePhone =
      "Alternate phone must be between 8 and 30 characters.";
  }

  if (form.email?.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      errors.email = "Please provide a valid email address.";
    }
  }

  return errors;
}

export function validateLinkForm(form) {
  const errors = {};
  if (!form.studentId) errors.studentId = "Student is required.";
  if (!form.relationship) errors.relationship = "Relationship is required.";
  return errors;
}
