import { useEffect, useId, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";

import Alert from "../../components/ui/Alert";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import Input from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { toastError } from "../../components/ui/Toast";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { createGuardian, updateGuardian } from "../../services/guardians/guardian.service";
import { createStudent, updateStudent } from "../../services/students/student.service";
import { cn } from "../../utils/cn";
import {
  GENDER_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  buildGuardianPayload,
  buildStudentPayload,
  getApiErrorMessage,
  mapStudentToForm,
} from "./student.mappers";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  otherNames: "",
  gender: "",
  dateOfBirth: "",
  nationality: "Ghanaian",
  studentId: "",
  classId: "",
  admissionDate: "",
  status: "Active",
  previousSchool: "",
  guardianId: "",
  guardianName: "",
  relationship: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianOccupation: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  region: "",
  digitalAddress: "",
  bloodType: "",
  allergies: "",
  medicalConditions: "",
  emergencyNotes: "",
};

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Guardian",
  "Uncle",
  "Aunt",
  "Sibling",
  "Other",
];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
    typeof option === "object"
      ? option
      : { value: option, label: option }
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

function validateStudentForm(form) {
  const errors = {};

  if (!form.firstName.trim() || form.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  }
  if (!form.lastName.trim() || form.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  }
  if (!form.gender) errors.gender = "Select a gender.";
  if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  if (!form.studentId.trim() || form.studentId.trim().length < 3) {
    errors.studentId = "Admission number must be at least 3 characters.";
  }
  if (!form.classId) errors.classId = "Select a class.";
  if (!form.admissionDate) errors.admissionDate = "Admission date is required.";
  if (!form.status) errors.status = "Select a status.";
  if (!form.guardianName.trim()) errors.guardianName = "Guardian name is required.";
  if (!form.relationship) errors.relationship = "Select a relationship.";
  if (!form.guardianPhone.trim()) {
    errors.guardianPhone = "Guardian phone is required.";
  } else if (!/^[0-9+\s()-]{8,20}$/.test(form.guardianPhone.trim())) {
    errors.guardianPhone = "Enter a valid phone number (8–20 characters).";
  }
  if (!form.address.trim()) errors.address = "Residential address is required.";

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (
    form.guardianEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardianEmail.trim())
  ) {
    errors.guardianEmail = "Enter a valid guardian email.";
  }
  if (form.phone.trim() && !/^[0-9+\s()-]{7,20}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

/**
 * Student registration / edit form in a right-side drawer.
 * Create: guardian then student. Edit: update student (+ guardian when present).
 */
export default function StudentRegistrationForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  student = null,
  classOptions = [],
  classesLoading = false,
  classesError = "",
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

    setForm(isEdit && student ? mapStudentToForm(student) : INITIAL_FORM);
    setErrors({});
    setSubmitError("");
    setPhotoPreview("");
    setPhotoName("");
    setSaving(false);

    return undefined;
  }, [open, isEdit, student]);

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
    const nextErrors = validateStudentForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        const studentId = student?.id;
        if (!studentId) {
          throw new Error("Missing student id for update.");
        }

        let guardianId = form.guardianId ? Number(form.guardianId) : null;
        const guardianPayload = buildGuardianPayload(form);

        if (guardianId) {
          await updateGuardian(guardianId, guardianPayload);
        } else {
          const guardianResponse = await createGuardian(guardianPayload);
          guardianId = guardianResponse?.data?.id;
          if (!guardianId) {
            throw new Error("Guardian was created but no ID was returned.");
          }
        }

        const studentResponse = await updateStudent(
          studentId,
          buildStudentPayload(form, guardianId)
        );

        onSuccess?.(studentResponse?.data, studentResponse?.message, "update");
        onClose?.();
        return;
      }

      const guardianResponse = await createGuardian(buildGuardianPayload(form));
      const guardianId = guardianResponse?.data?.id;

      if (!guardianId) {
        throw new Error("Guardian was created but no ID was returned.");
      }

      const studentResponse = await createStudent(
        buildStudentPayload(form, guardianId)
      );

      onSuccess?.(studentResponse?.data, studentResponse?.message, "create");
      onClose?.();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Unable to update student. Please review the form and try again."
          : "Unable to save student. Please review the form and try again."
      );
      setSubmitError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") || "New Student";

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      title={isEdit ? "Edit Student" : "Register Student"}
      description={
        isEdit
          ? "Update the student record. Changes are saved through the Students API."
          : "Complete the sections below to enroll a new student."
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
            form="student-registration-form"
            variant="primary"
            size="sm"
            className="w-auto"
            loading={saving}
            disabled={saving || classesLoading || Boolean(classesError)}
          >
            {isEdit ? "Update Student" : "Save Student"}
          </Button>
        </>
      }
    >
      <form
        id="student-registration-form"
        className="space-y-[var(--space-6)]"
        onSubmit={handleSave}
        noValidate
      >
        {submitError && <Alert variant="error" message={submitError} />}

        {classesError && (
          <Alert
            variant="error"
            message={classesError}
          />
        )}

        {Object.keys(errors).length > 0 && !submitError && (
          <Alert
            variant="error"
            message="Please correct the highlighted fields before saving."
          />
        )}

        <FormSection
          title="Personal Information"
          description="Legal name and demographic details for the student record."
        >
          <Input
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={updateField}
            placeholder="e.g. Emmanuel"
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
            placeholder="e.g. Adjei"
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
            required
            size="sm"
            error={errors.dateOfBirth}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Nationality"
            name="nationality"
            value={form.nationality}
            onChange={updateField}
            placeholder="Nationality"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
        </FormSection>

        <FormSection
          title="Academic Information"
          description="Class placement and admission details for this academic year."
        >
          <Input
            label="Admission number"
            name="studentId"
            value={form.studentId}
            onChange={updateField}
            placeholder="e.g. DIS2026001"
            required
            size="sm"
            error={errors.studentId}
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Class"
            name="classId"
            value={form.classId}
            onChange={updateField}
            options={classOptions}
            placeholder={classesLoading ? "Loading classes…" : "Select class…"}
            required
            error={errors.classId}
            disabled={saving || classesLoading || Boolean(classesError)}
          />
          {classesLoading && (
            <div
              className="mb-5 sm:col-span-2"
              role="status"
              aria-live="polite"
              aria-label="Loading available classes"
            >
              <Skeleton className="h-2 w-full" />
              <span className="sr-only">Loading available classes…</span>
            </div>
          )}
          <Input
            label="Admission date"
            name="admissionDate"
            type="date"
            value={form.admissionDate}
            onChange={updateField}
            required
            size="sm"
            error={errors.admissionDate}
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={updateField}
            options={STUDENT_STATUS_OPTIONS}
            required
            error={errors.status}
            disabled={saving}
          />
          <Input
            label="Previous school"
            name="previousSchool"
            value={form.previousSchool}
            onChange={updateField}
            placeholder="Optional — not stored by API yet"
            size="sm"
            disabled={saving}
            className="mb-5 sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Parent / Guardian"
          description="Primary contact responsible for the student. A guardian record is created first."
        >
          <Input
            label="Guardian full name"
            name="guardianName"
            value={form.guardianName}
            onChange={updateField}
            placeholder="e.g. Kwesi Adjei"
            required
            size="sm"
            error={errors.guardianName}
            disabled={saving}
            className="mb-5"
          />
          <SelectField
            label="Relationship"
            name="relationship"
            value={form.relationship}
            onChange={updateField}
            options={RELATIONSHIPS}
            required
            error={errors.relationship}
            disabled={saving}
          />
          <Input
            label="Guardian phone"
            name="guardianPhone"
            type="tel"
            value={form.guardianPhone}
            onChange={updateField}
            placeholder="024xxxxxxx"
            required
            size="sm"
            error={errors.guardianPhone}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Guardian email"
            name="guardianEmail"
            type="email"
            value={form.guardianEmail}
            onChange={updateField}
            placeholder="guardian@email.com"
            size="sm"
            error={errors.guardianEmail}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Occupation"
            name="guardianOccupation"
            value={form.guardianOccupation}
            onChange={updateField}
            placeholder="Optional"
            size="sm"
            disabled={saving}
            className="mb-5 sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Contact & Address"
          description="Student contact details and residential location."
        >
          <Input
            label="Student phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            placeholder="Optional"
            size="sm"
            error={errors.phone}
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Student email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="student@email.com"
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
            placeholder="House number, street, landmark"
            required
            error={errors.address}
            disabled={saving}
          />
          <Input
            label="City / Town"
            name="city"
            value={form.city}
            onChange={updateField}
            placeholder="Optional — not stored by API yet"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Region"
            name="region"
            value={form.region}
            onChange={updateField}
            placeholder="Optional — not stored by API yet"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <Input
            label="Digital address"
            name="digitalAddress"
            value={form.digitalAddress}
            onChange={updateField}
            placeholder="Optional — not stored by API yet"
            size="sm"
            disabled={saving}
            className="mb-5 sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Medical Information"
          description="Optional health notes for staff awareness. Not persisted by the Students API yet."
          optional
        >
          <SelectField
            label="Blood type"
            name="bloodType"
            value={form.bloodType}
            onChange={updateField}
            options={BLOOD_TYPES}
            placeholder="Unknown / not provided"
            disabled={saving}
          />
          <Input
            label="Allergies"
            name="allergies"
            value={form.allergies}
            onChange={updateField}
            placeholder="e.g. Peanuts, penicillin"
            size="sm"
            disabled={saving}
            className="mb-5"
          />
          <TextAreaField
            label="Medical conditions"
            name="medicalConditions"
            value={form.medicalConditions}
            onChange={updateField}
            placeholder="Chronic conditions or ongoing care notes"
            disabled={saving}
          />
          <TextAreaField
            label="Emergency notes"
            name="emergencyNotes"
            value={form.emergencyNotes}
            onChange={updateField}
            placeholder="Anything responders should know"
            disabled={saving}
          />
        </FormSection>

        <FormSection
          title="Student Photo"
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
              ? "Updating saves student changes and syncs the linked guardian when available."
              : "Saving creates a guardian, then the student, using the existing Students and Guardians APIs."}
          </Caption>
        </div>
      </form>
    </Drawer>
  );
}
