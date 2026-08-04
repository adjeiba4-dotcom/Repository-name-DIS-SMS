import { useEffect, useId, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";

import Alert from "../../components/ui/Alert";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import Input from "../../components/ui/Input";
import { toastError } from "../../components/ui/Toast";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import {
  createTeacher,
  updateTeacher,
} from "../../services/teachers/teacher.service";
import { cn } from "../../utils/cn";
import {
  GENDER_OPTIONS,
  TEACHER_STATUS_OPTIONS,
  buildTeacherPayload,
  getApiErrorMessage,
  mapTeacherToForm,
} from "./teacher.mappers";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  otherNames: "",
  gender: "",
  dateOfBirth: "",
  nationality: "Ghanaian",
  staffNo: "",
  departmentId: "",
  employmentDate: "",
  status: "Active",
  employmentType: "Full-time",
  jobTitle: "Teacher",
  qualification: "",
  specialization: "",
  institution: "",
  yearObtained: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  region: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  bankBranch: "",
};

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Volunteer"];

const fieldShell = cn(
  "flex w-full rounded-[var(--radius-xl)] border bg-[var(--color-input-bg)] shadow-[var(--shadow-sm)]",
  "transition-[var(--transition-normal)]"
);

const selectClassName = cn(
  "h-10 w-full rounded-[var(--radius-xl)] bg-transparent px-[var(--space-4)]",
  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)] outline-none",
  "disabled:cursor-not-allowed"
);

const textareaClassName = cn(
  "min-h-24 w-full resize-y rounded-[var(--radius-xl)] bg-transparent px-[var(--space-4)] py-[var(--space-3)]",
  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)] outline-none",
  "placeholder:text-[var(--color-input-placeholder)] disabled:cursor-not-allowed"
);

function normalizeOptions(options = []) {
  return options.map((option) =>
    typeof option === "object" ? option : { value: option, label: option }
  );
}

function FormSection({ title, description, optional = false, children }) {
  return (
    <section className="space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-6)] last:border-b-0 last:pb-0">
      <div className="space-y-[var(--space-1)]">
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <H3 size="sm">{title}</H3>
          {optional && (
            <Caption
              variant="muted"
              size="sm"
              className="m-0 rounded-[var(--radius-full)] bg-[var(--color-surface-muted)] px-[var(--space-2)] py-[var(--space-1)]"
            >
              Optional
            </Caption>
          )}
        </div>
        {description && (
          <Body variant="muted" size="sm" className="m-0">
            {description}
          </Body>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-[var(--space-4)] gap-y-0 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  error = "",
  required = false,
  disabled = false,
  className = "",
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const normalized = normalizeOptions(options);

  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger-500)]" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          fieldShell,
          error
            ? "border-[var(--color-danger-500)]"
            : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-4 focus-within:ring-[var(--color-brand-100)]",
          disabled && "bg-[var(--color-input-disabled-bg)] opacity-70"
        )}
      >
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={selectClassName}
        >
          <option value="">{placeholder}</option>
          {normalized.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  disabled = false,
  className = "",
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("mb-5 sm:col-span-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger-500)]" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <div
        className={cn(
          fieldShell,
          error
            ? "border-[var(--color-danger-500)]"
            : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-4 focus-within:ring-[var(--color-brand-100)]",
          disabled && "bg-[var(--color-input-disabled-bg)] opacity-70"
        )}
      >
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={textareaClassName}
        />
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function validateTeacherForm(form) {
  const errors = {};

  if (!form.firstName.trim() || form.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  }
  if (!form.lastName.trim() || form.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  }
  if (!form.gender) errors.gender = "Select a gender.";
  if (!form.staffNo.trim() || form.staffNo.trim().length < 3) {
    errors.staffNo = "Staff number must be at least 3 characters.";
  }
  if (!form.departmentId) errors.departmentId = "Select a department.";
  if (!form.employmentDate) {
    errors.employmentDate = "Employment date is required.";
  }
  if (!form.status) errors.status = "Select a status.";
  if (!form.employmentType) {
    errors.employmentType = "Select an employment type.";
  }
  if (!form.qualification.trim()) {
    errors.qualification = "Highest qualification is required.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9+\s()-]{8,20}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number (8–20 characters).";
  }
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.address.trim()) errors.address = "Residential address is required.";

  if (
    form.yearObtained.trim() &&
    !/^(19|20)\d{2}$/.test(form.yearObtained.trim())
  ) {
    errors.yearObtained = "Enter a valid 4-digit year.";
  }

  const bankingStarted = [
    form.bankName,
    form.accountName,
    form.accountNumber,
    form.bankBranch,
  ].some((value) => value.trim());

  if (bankingStarted) {
    if (!form.bankName.trim()) {
      errors.bankName =
        "Bank name is required when banking details are provided.";
    }
    if (!form.accountName.trim()) {
      errors.accountName =
        "Account name is required when banking details are provided.";
    }
    if (!form.accountNumber.trim()) {
      errors.accountNumber =
        "Account number is required when banking details are provided.";
    } else if (!/^[0-9-]{6,20}$/.test(form.accountNumber.trim())) {
      errors.accountNumber = "Enter a valid account number.";
    }
  }

  return errors;
}

/**
 * Teacher registration / edit form in a right-side drawer.
 * Create/update via Teachers API; UI-only fields are not persisted.
 */
export default function TeacherRegistrationForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  teacher = null,
  departmentOptions = [],
  departmentsLoading = false,
  departmentsError = "",
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const mapped = isEdit && teacher ? mapTeacherToForm(teacher) : null;
    setForm(mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM });
    setErrors({});
    setSubmitError("");
    setPhotoPreview("");
    setPhotoName("");
    setSaving(false);

    return undefined;
  }, [open, isEdit, teacher]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setSubmitError("");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        photo: "Please choose an image file.",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: "Image must be 2MB or smaller.",
      }));
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoName(file.name);
    setErrors((current) => {
      const next = { ...current };
      delete next.photo;
      return next;
    });
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview("");
    setPhotoName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextErrors = validateTeacherForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const payload = buildTeacherPayload(form);

      if (isEdit) {
        const teacherId = teacher?.id;
        if (!teacherId) {
          throw new Error("Missing teacher id for update.");
        }

        const response = await updateTeacher(teacherId, payload);
        onSuccess?.(response?.data, response?.message, "update");
        onClose?.();
        return;
      }

      const response = await createTeacher(payload);
      onSuccess?.(response?.data, response?.message, "create");
      onClose?.();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Unable to update teacher. Please review the form and try again."
          : "Unable to save teacher. Please review the form and try again."
      );
      setSubmitError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") || "New Teacher";

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      title={isEdit ? "Edit Teacher" : "Register Teacher"}
      description={
        isEdit
          ? "Update the teacher record. Changes are saved through the Teachers API."
          : "Complete the sections below to add a new teaching staff member."
      }
      size="xl"
      disabled={saving}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="teacher-registration-form"
            variant="primary"
            size="sm"
            className="w-auto"
            loading={saving}
            disabled={saving || departmentsLoading || Boolean(departmentsError)}
          >
            {isEdit ? "Update Teacher" : "Save Teacher"}
          </Button>
        </>
      }
    >
      <form
        id="teacher-registration-form"
        className="space-y-[var(--space-6)]"
        onSubmit={handleSave}
        noValidate
      >
        {submitError && <Alert variant="error" message={submitError} />}

        {departmentsError && (
          <Alert variant="error" message={departmentsError} />
        )}

        {Object.keys(errors).length > 0 && !submitError && (
          <Alert
            variant="error"
            message="Please correct the highlighted fields before saving."
          />
        )}

        <FormSection
          title="Personal Information"
          description="Legal name and demographic details for the staff record."
        >
          <Input
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={updateField}
            placeholder="e.g. Kwame"
            required
            size="sm"
            error={errors.firstName}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={updateField}
            placeholder="e.g. Mensah"
            required
            size="sm"
            error={errors.lastName}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Other names"
            name="otherNames"
            value={form.otherNames}
            onChange={updateField}
            placeholder="Optional middle names"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={updateField}
            options={GENDER_OPTIONS}
            required
            error={errors.gender}
            disabled={saving}
          />
          <Input
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={updateField}
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Nationality"
            name="nationality"
            value={form.nationality}
            onChange={updateField}
            placeholder="e.g. Ghanaian"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Employment Information"
          description="Staff identifiers, department assignment, and employment status."
        >
          <Input
            label="Staff number"
            name="staffNo"
            value={form.staffNo}
            onChange={updateField}
            placeholder="e.g. TCH-2026-013"
            required
            size="sm"
            error={errors.staffNo}
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Department"
            name="departmentId"
            value={form.departmentId}
            onChange={updateField}
            options={departmentOptions}
            placeholder={
              departmentsLoading ? "Loading departments…" : "Select department"
            }
            required
            error={errors.departmentId}
            disabled={saving || departmentsLoading || Boolean(departmentsError)}
          />
          <Input
            label="Employment date"
            name="employmentDate"
            type="date"
            value={form.employmentDate}
            onChange={updateField}
            required
            size="sm"
            error={errors.employmentDate}
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={updateField}
            options={TEACHER_STATUS_OPTIONS}
            required
            error={errors.status}
            disabled={saving}
          />
          <SelectField
            label="Employment type"
            name="employmentType"
            value={form.employmentType}
            onChange={updateField}
            options={EMPLOYMENT_TYPES}
            required
            error={errors.employmentType}
            disabled={saving}
          />
          <Input
            label="Job title"
            name="jobTitle"
            value={form.jobTitle}
            onChange={updateField}
            placeholder="e.g. Senior Teacher"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Academic Qualifications"
          description="Highest qualification and subject specialization."
        >
          <Input
            label="Highest qualification"
            name="qualification"
            value={form.qualification}
            onChange={updateField}
            placeholder="e.g. M.Ed Mathematics"
            required
            size="sm"
            error={errors.qualification}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Specialization"
            name="specialization"
            value={form.specialization}
            onChange={updateField}
            placeholder="e.g. Pure Mathematics"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Institution"
            name="institution"
            value={form.institution}
            onChange={updateField}
            placeholder="e.g. University of Ghana"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Year obtained"
            name="yearObtained"
            value={form.yearObtained}
            onChange={updateField}
            placeholder="e.g. 2018"
            size="sm"
            error={errors.yearObtained}
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Primary phone, email, and residential address."
        >
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={updateField}
            placeholder="e.g. 0241112233"
            required
            size="sm"
            error={errors.phone}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="e.g. name@staff.dissms.edu"
            required
            size="sm"
            error={errors.email}
            disabled={saving}
            className="mb-5"
          />
          <TextAreaField
            label="Residential address"
            name="address"
            value={form.address}
            onChange={updateField}
            placeholder="Street, house number, landmark"
            required
            error={errors.address}
            disabled={saving}
          />
          <Input
            label="City / town"
            name="city"
            value={form.city}
            onChange={updateField}
            placeholder="e.g. Accra"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Region"
            name="region"
            value={form.region}
            onChange={updateField}
            placeholder="e.g. Greater Accra"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Banking Information"
          description="Optional payroll details. Not persisted by the Teachers API yet."
          optional
        >
          <Input
            label="Bank name"
            name="bankName"
            value={form.bankName}
            onChange={updateField}
            placeholder="e.g. GCB Bank"
            size="sm"
            error={errors.bankName}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Account name"
            name="accountName"
            value={form.accountName}
            onChange={updateField}
            placeholder="Name as on account"
            size="sm"
            error={errors.accountName}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Account number"
            name="accountNumber"
            value={form.accountNumber}
            onChange={updateField}
            placeholder="Digits only"
            size="sm"
            error={errors.accountNumber}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Branch"
            name="bankBranch"
            value={form.bankBranch}
            onChange={updateField}
            placeholder="e.g. Accra Main"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Teacher Photo"
          description="Upload a recent passport-style photo. Preview only — upload endpoint not connected."
          optional
        >
          <div className="mb-5 flex flex-col gap-[var(--space-4)] sm:col-span-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-[var(--space-4)]">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={`${displayName} preview`}
                  className="h-20 w-20 rounded-[var(--radius-xl)] object-cover ring-1 ring-[var(--color-border-default)]"
                />
              ) : (
                <Avatar name={displayName} size="xl" variant="rounded" />
              )}
              <div className="min-w-0 space-y-[var(--space-1)]">
                <Body
                  variant="default"
                  size="sm"
                  className="m-0 font-[number:var(--font-weight-semibold)]"
                >
                  {photoName || "No photo selected"}
                </Body>
                <Caption variant="muted" size="sm" className="m-0">
                  JPG or PNG · max 2MB · UI preview only
                </Caption>
                {errors.photo && (
                  <Caption
                    variant="muted"
                    size="sm"
                    className="m-0 text-[var(--color-danger-600)]"
                    role="alert"
                  >
                    {errors.photo}
                  </Caption>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-[var(--space-2)]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handlePhotoChange}
                disabled={saving}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <ImagePlus size={16} aria-hidden />
                Choose photo
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-auto"
                  onClick={clearPhoto}
                  disabled={saving}
                >
                  <Trash2 size={16} aria-hidden />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </FormSection>

        <div className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-4)]">
          <Camera
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-brand-600)]"
            aria-hidden
          />
          <Caption variant="secondary" size="sm" className="m-0">
            Required fields are marked with *.{" "}
            {isEdit
              ? "Updating saves teacher changes through the Teachers API."
              : "Saving creates the teacher using the Teachers API. Banking and photo remain UI-only."}
          </Caption>
        </div>
      </form>
    </Drawer>
  );
}
