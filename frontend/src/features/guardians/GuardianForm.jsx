import { useEffect, useId, useRef, useState } from "react";

import {
  DatePickerField,
  PhoneField,
  SelectField,
  SubmitButton,
  TextField,
  UploadField,
  fieldLabelClassName,
  fieldShellState,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  createGuardian,
  updateGuardian,
} from "../../services/guardians/guardian.service";
import {
  GENDER_OPTIONS,
  GUARDIAN_STATUS_OPTIONS,
  buildGuardianPayload,
  getApiErrorMessage,
  getGuardianFullName,
  mapGuardianToForm,
  validateGuardianForm,
} from "./guardian.mappers";

const INITIAL_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  nationalId: "",
  phone: "",
  alternatePhone: "",
  email: "",
  occupation: "",
  employer: "",
  residentialAddress: "",
  digitalAddress: "",
  notes: "",
  status: "Active",
  photo: "",
};

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

/**
 * Add / Edit guardian drawer form using shared form components.
 * Exported aliases: AddGuardian, EditGuardian
 */
export default function GuardianForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  guardian = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const fileInputKey = useRef(0);

  useEffect(() => {
    if (!open) return undefined;

    const mapped = isEdit && guardian ? mapGuardianToForm(guardian) : null;
    setForm(mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM });
    setErrors({});
    setSubmitError("");
    setPhotoPreview(mapped?.photo || "");
    setPhotoName(mapped?.photo ? "Existing photo" : "");
    setSaving(false);
    fileInputKey.current += 1;

    return undefined;
  }, [open, isEdit, guardian]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
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

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setPhotoName(file.name);
    setForm((current) => ({ ...current, photo: "" }));
    setErrors((current) => {
      const next = { ...current };
      delete next.photo;
      return next;
    });
  };

  const clearPhoto = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview("");
    setPhotoName("");
    setForm((current) => ({ ...current, photo: "" }));
    fileInputKey.current += 1;
  };

  const handleCancel = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextErrors = validateGuardianForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);

    try {
      const payload = buildGuardianPayload(form);
      const response = isEdit
        ? await updateGuardian(guardian.id, payload)
        : await createGuardian(payload);

      onSuccess?.(
        response?.data ?? null,
        response?.message,
        isEdit ? "update" : "create"
      );
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isEdit
            ? "Unable to update guardian. Please try again."
            : "Unable to create guardian. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    getGuardianFullName(form) || (isEdit ? "Guardian" : "New guardian");

  return (
    <Drawer
      open={open}
      onClose={saving ? undefined : handleCancel}
      title={isEdit ? "Edit Guardian" : "Add Guardian"}
      description={
        isEdit
          ? "Update guardian contact and profile details."
          : "Register a new guardian. Guardian number is generated automatically."
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
          <SubmitButton
            form={formId}
            loading={saving}
            size="sm"
          >
            {isEdit ? "Save Changes" : "Create Guardian"}
          </SubmitButton>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-[var(--space-6)]"
        onSubmit={handleSave}
        noValidate
      >
        {submitError ? (
          <Alert variant="error" title="Save failed" message={submitError} />
        ) : null}

        <FormSection
          title="Personal details"
          description="Core identity fields required for registration."
        >
          <TextField
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={updateField}
            required
            error={errors.firstName}
            disabled={saving}
          />
          <TextField
            label="Middle name"
            name="middleName"
            value={form.middleName}
            onChange={updateField}
            error={errors.middleName}
            disabled={saving}
          />
          <TextField
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={updateField}
            required
            error={errors.lastName}
            disabled={saving}
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
          <DatePickerField
            label="Date of birth"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={updateField}
            error={errors.dateOfBirth}
            disabled={saving}
          />
          <TextField
            label="National ID"
            name="nationalId"
            value={form.nationalId}
            onChange={updateField}
            error={errors.nationalId}
            disabled={saving}
          />
        </FormSection>

        <FormSection
          title="Contact"
          description="Primary phone is required and must be unique."
        >
          <PhoneField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={updateField}
            required
            error={errors.phone}
            disabled={saving}
          />
          <PhoneField
            label="Alternate phone"
            name="alternatePhone"
            value={form.alternatePhone}
            onChange={updateField}
            error={errors.alternatePhone}
            disabled={saving}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            error={errors.email}
            disabled={saving}
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection title="Employment" optional>
          <TextField
            label="Occupation"
            name="occupation"
            value={form.occupation}
            onChange={updateField}
            disabled={saving}
          />
          <TextField
            label="Employer"
            name="employer"
            value={form.employer}
            onChange={updateField}
            disabled={saving}
          />
        </FormSection>

        <FormSection title="Address" optional>
          <TextField
            label="Residential address"
            name="residentialAddress"
            value={form.residentialAddress}
            onChange={updateField}
            disabled={saving}
            className="sm:col-span-2"
          />
          <TextField
            label="Digital address"
            name="digitalAddress"
            value={form.digitalAddress}
            onChange={updateField}
            placeholder="e.g. GA-123-4567"
            disabled={saving}
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={updateField}
            options={GUARDIAN_STATUS_OPTIONS}
            disabled={saving}
          />
        </FormSection>

        <FormSection title="Notes" optional>
          <div className="mb-5 sm:col-span-2">
            <label htmlFor={`${formId}-notes`} className={fieldLabelClassName}>
              Notes
            </label>
            <div className={fieldShellState({ disabled: saving })}>
              <textarea
                id={`${formId}-notes`}
                name="notes"
                value={form.notes}
                onChange={updateField}
                disabled={saving}
                rows={4}
                className={cn(
                  "min-h-24 w-full resize-y rounded-[var(--radius-xl)] bg-transparent px-[var(--space-4)] py-[var(--space-3)]",
                  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)] outline-none",
                  "placeholder:text-[var(--color-input-placeholder)] disabled:cursor-not-allowed"
                )}
                placeholder="Internal remarks about this guardian"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Photo"
          description="Upload a recent passport-style photo. Preview only — upload endpoint not connected."
          optional
        >
          <UploadField
            key={fileInputKey.current}
            label="Profile photo"
            name="photo"
            previewSrc={photoPreview}
            previewName={photoName}
            valueName={photoName}
            avatarName={displayName}
            error={errors.photo}
            disabled={saving}
            onChange={handlePhotoChange}
            onClear={clearPhoto}
            className="sm:col-span-2 mb-0"
          />
        </FormSection>
      </form>
    </Drawer>
  );
}

/** Explicit create-mode alias */
export function AddGuardian(props) {
  return <GuardianForm {...props} mode="create" />;
}

/** Explicit edit-mode alias */
export function EditGuardian(props) {
  return <GuardianForm {...props} mode="edit" />;
}
