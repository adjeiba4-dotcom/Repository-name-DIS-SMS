import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body, Caption } from "../../components/ui/Typography";
import { getStudents } from "../../services/students/student.service";
import { linkGuardianToStudent } from "../../services/guardians/guardian.service";
import {
  RELATIONSHIP_OPTIONS,
  buildLinkPayload,
  getApiErrorMessage,
  getGuardianFullName,
  validateLinkForm,
} from "./guardian.mappers";
import { toastSuccess } from "../../components/ui/Toast";
import { cn } from "../../utils/cn";

const INITIAL_FORM = {
  studentId: "",
  relationship: "",
  isPrimary: false,
  emergencyContact: false,
  financialResponsibility: false,
  canPickup: false,
  remarks: "",
};

function CheckboxField({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-3)]",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-[var(--color-input-border)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-100)]"
      />
      <span className="text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </label>
  );
}

/**
 * Link an existing student to the current guardian.
 */
export default function GuardianLinkStudentDialog({
  open,
  guardian,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await getStudents();
      return response?.data ?? [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setSubmitError("");
    setSaving(false);
  }, [open]);

  const linkedIds = useMemo(() => {
    return new Set(
      (guardian?.studentGuardians || []).map((link) => String(link.studentId))
    );
  }, [guardian]);

  const studentOptions = useMemo(() => {
    return (studentsQuery.data || [])
      .filter((student) => !linkedIds.has(String(student.id)))
      .map((student) => ({
        value: String(student.id),
        label: `${[student.firstName, student.lastName].filter(Boolean).join(" ")} (${student.admissionNo || student.id})`,
      }));
  }, [studentsQuery.data, linkedIds]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLinkForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSubmitError("");

    try {
      const payload = buildLinkPayload(form, guardian.id);
      const response = await linkGuardianToStudent(
        Number(form.studentId),
        payload
      );
      toastSuccess(
        response?.message || "Guardian linked to student successfully."
      );
      onSuccess?.(response?.data ?? null);
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Unable to link student. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title="Add Student"
      size="md"
      disabled={saving}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <SubmitButton
            form="guardian-link-student-form"
            loading={saving}
            size="sm"
          >
            Link Student
          </SubmitButton>
        </>
      }
    >
      <form
        id="guardian-link-student-form"
        className="space-y-[var(--space-4)]"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <Body
            variant="default"
            size="sm"
            className="m-0 font-[number:var(--font-weight-semibold)]"
          >
            {getGuardianFullName(guardian) || "Guardian"}
          </Body>
          <Caption variant="muted" size="sm" className="m-0">
            Select a student and relationship flags for this guardian.
          </Caption>
        </div>

        {submitError ? (
          <Alert variant="error" title="Link failed" message={submitError} />
        ) : null}

        {studentsQuery.isError ? (
          <Alert
            variant="error"
            title="Students unavailable"
            message={getApiErrorMessage(
              studentsQuery.error,
              "Unable to load students."
            )}
          />
        ) : null}

        <SelectField
          label="Student"
          name="studentId"
          value={form.studentId}
          onChange={updateField}
          options={studentOptions}
          placeholder={
            studentsQuery.isLoading ? "Loading students…" : "Select student…"
          }
          required
          error={errors.studentId}
          disabled={saving || studentsQuery.isLoading}
          className="mb-0"
        />

        <SelectField
          label="Relationship"
          name="relationship"
          value={form.relationship}
          onChange={updateField}
          options={RELATIONSHIP_OPTIONS}
          required
          error={errors.relationship}
          disabled={saving}
          className="mb-0"
        />

        <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
          <CheckboxField
            id="link-isPrimary"
            name="isPrimary"
            label="Primary Guardian"
            checked={form.isPrimary}
            onChange={updateField}
            disabled={saving}
          />
          <CheckboxField
            id="link-emergencyContact"
            name="emergencyContact"
            label="Emergency Contact"
            checked={form.emergencyContact}
            onChange={updateField}
            disabled={saving}
          />
          <CheckboxField
            id="link-financialResponsibility"
            name="financialResponsibility"
            label="Financial Responsibility"
            checked={form.financialResponsibility}
            onChange={updateField}
            disabled={saving}
          />
          <CheckboxField
            id="link-canPickup"
            name="canPickup"
            label="Can Pickup"
            checked={form.canPickup}
            onChange={updateField}
            disabled={saving}
          />
        </div>

        <TextField
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={updateField}
          disabled={saving}
          className="mb-0"
        />
      </form>
    </Modal>
  );
}
