import { useId, useState } from "react";

import {
  FormGridFull,
  FormSection,
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import {
  createDepartment,
  restoreDepartment,
  updateDepartment,
} from "../../services/departments/department.service";
import {
  DEPARTMENT_STATUS_OPTIONS,
  buildDepartmentPayload,
  getApiErrorMessage,
  getArchivedDuplicateConflict,
  mapDepartmentToForm,
  validateDepartmentForm,
} from "./department.mappers";

const INITIAL_FORM = {
  code: "",
  name: "",
  description: "",
  status: "Active",
};

function buildInitialForm(isEdit, department) {
  const mapped = isEdit && department ? mapDepartmentToForm(department) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function DepartmentFormBody({
  formId,
  isEdit,
  department,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(isEdit, department)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [archivedConflict, setArchivedConflict] = useState(null);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (archivedConflict) {
      setArchivedConflict(null);
      setSubmitError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateDepartmentForm(form);
    setErrors(nextErrors);
    setSubmitError("");
    setArchivedConflict(null);

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildDepartmentPayload(form);
      const response = isEdit
        ? await updateDepartment(department.id, payload)
        : await createDepartment(payload);

      onSuccess?.(
        response?.data,
        response?.message,
        isEdit ? "update" : "create"
      );
      onClose?.();
    } catch (error) {
      const archived = getArchivedDuplicateConflict(error);
      if (archived) {
        setArchivedConflict(archived);
        setSubmitError(archived.message);
      } else {
        setSubmitError(
          getApiErrorMessage(
            error,
            isEdit
              ? "Unable to update department."
              : "Unable to create department."
          )
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreArchived = async () => {
    if (!archivedConflict?.archivedId) return;

    setRestoring(true);
    setSubmitError("");
    try {
      const response = await restoreDepartment(archivedConflict.archivedId);
      onSuccess?.(
        response?.data,
        response?.message || "Department restored successfully.",
        "restore"
      );
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Unable to restore the archived department. Please try again."
        )
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-[var(--space-6)]"
    >
      {submitError ? (
        <div className="space-y-[var(--space-3)]">
          <Alert
            variant="error"
            title={
              archivedConflict
                ? "Archived department found"
                : "Unable to save"
            }
            message={submitError}
          />
          {archivedConflict ? (
            <div className="flex flex-wrap gap-[var(--space-2)]">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                loading={restoring}
                disabled={saving}
                onClick={handleRestoreArchived}
              >
                Restore archived department
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <FormSection
        title="Department details"
        description="Code and name must be unique. Archived departments still reserve their code and name until restored."
      >
        <TextField
          label="Code"
          name="code"
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
          placeholder="e.g. SCI"
          error={errors.code}
          required
        />
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="e.g. Science Department"
          error={errors.name}
          required
        />
        <FormGridFull>
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Optional notes"
            error={errors.description}
          />
        </FormGridFull>
        <FormGridFull>
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            options={DEPARTMENT_STATUS_OPTIONS.map((item) => ({
              value: item,
              label: item,
            }))}
            error={errors.status}
            required
          />
        </FormGridFull>
      </FormSection>

      <div className="mt-[var(--space-6)] flex flex-wrap justify-end gap-[var(--space-2)] border-t border-[var(--color-border-muted)] pt-[var(--space-4)]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-auto"
          onClick={onClose}
          disabled={saving || restoring}
        >
          Cancel
        </Button>
        <SubmitButton loading={saving} size="sm" disabled={restoring}>
          {isEdit ? "Save Changes" : "Create Department"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit department drawer form.
 * Exported aliases: AddDepartment, EditDepartment
 */
export default function DepartmentForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  department = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${department?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Department" : "Add Department"}
      description={
        isEdit
          ? "Update department code, name, description, and status."
          : "Create a new academic department for teachers, subjects, and classes."
      }
      size="md"
    >
      {open ? (
        <DepartmentFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          department={department}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddDepartment(props) {
  return <DepartmentForm mode="create" {...props} />;
}

export function EditDepartment(props) {
  return <DepartmentForm mode="edit" {...props} />;
}
