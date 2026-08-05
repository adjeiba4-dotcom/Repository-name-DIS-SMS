import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { getClasses } from "../../services/classes/class.service";
import { getDepartments } from "../../services/departments/department.service";
import {
  createSubject,
  updateSubject,
} from "../../services/subjects/subject.service";
import {
  SUBJECT_CATEGORY_OPTIONS,
  SUBJECT_STATUS_OPTIONS,
  buildSubjectPayload,
  getApiErrorMessage,
  mapSubjectToForm,
  validateSubjectForm,
} from "./subject.mappers";

const INITIAL_FORM = {
  subjectCode: "",
  subjectName: "",
  shortName: "",
  departmentId: "",
  schoolClassId: "",
  category: "Core",
  creditHours: "",
  description: "",
  status: "Active",
};

function buildInitialForm(isEdit, subject) {
  const mapped = isEdit && subject ? mapSubjectToForm(subject) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function FormSection({ title, description, children }) {
  return (
    <section className="space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-6)] last:border-b-0 last:pb-0">
      <div className="space-y-[var(--space-1)]">
        <H3 size="sm">{title}</H3>
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

function SubjectFormBody({ formId, isEdit, subject, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildInitialForm(isEdit, subject));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const departmentsQuery = useQuery({
    queryKey: ["departments", "subject-form-options"],
    queryFn: async () => {
      const response = await getDepartments();
      return response?.data ?? [];
    },
  });

  const classesQuery = useQuery({
    queryKey: ["classes", "subject-form-options"],
    queryFn: async () => {
      const response = await getClasses({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const departmentOptions = (departmentsQuery.data ?? []).map((dept) => ({
    value: String(dept.id),
    label: dept.name,
  }));

  const classOptions = (classesQuery.data ?? []).map((schoolClass) => ({
    value: String(schoolClass.id),
    label: schoolClass.className
      ? `${schoolClass.className}${
          schoolClass.classCode ? ` (${schoolClass.classCode})` : ""
        }`
      : `Class #${schoolClass.id}`,
  }));

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSubjectForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildSubjectPayload(form);
      const response = isEdit
        ? await updateSubject(subject.id, payload)
        : await createSubject(payload);

      onSuccess?.(
        response?.data,
        response?.message,
        isEdit ? "update" : "create"
      );
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isEdit ? "Unable to update subject." : "Unable to create subject."
        )
      );
    } finally {
      setSaving(false);
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
        <Alert variant="danger" title="Unable to save">
          {submitError}
        </Alert>
      ) : null}

      <FormSection
        title="Subject details"
        description="Subject code and name must be unique across the catalog."
      >
        <TextField
          label="Subject code"
          name="subjectCode"
          value={form.subjectCode}
          onChange={(event) => updateField("subjectCode", event.target.value)}
          placeholder="e.g. MATH101"
          error={errors.subjectCode}
          required
        />
        <TextField
          label="Subject name"
          name="subjectName"
          value={form.subjectName}
          onChange={(event) => updateField("subjectName", event.target.value)}
          placeholder="e.g. Core Mathematics"
          error={errors.subjectName}
          required
        />
        <TextField
          label="Short name"
          name="shortName"
          value={form.shortName}
          onChange={(event) => updateField("shortName", event.target.value)}
          placeholder="e.g. Math"
          error={errors.shortName}
          required
        />
        <SelectField
          label="Category"
          name="category"
          value={form.category}
          onChange={(event) => updateField("category", event.target.value)}
          options={SUBJECT_CATEGORY_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.category}
          required
        />
        <TextField
          label="Credit hours"
          name="creditHours"
          type="number"
          min="1"
          value={form.creditHours}
          onChange={(event) => updateField("creditHours", event.target.value)}
          placeholder="e.g. 3"
          error={errors.creditHours}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={SUBJECT_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
        />
        <SelectField
          label="Department"
          name="departmentId"
          value={form.departmentId}
          onChange={(event) =>
            updateField("departmentId", event.target.value)
          }
          options={[
            { value: "", label: "No department" },
            ...departmentOptions,
          ]}
          error={errors.departmentId}
          disabled={departmentsQuery.isLoading}
        />
        <SelectField
          label="Assigned class"
          name="schoolClassId"
          value={form.schoolClassId}
          onChange={(event) =>
            updateField("schoolClassId", event.target.value)
          }
          options={[
            { value: "", label: "No class assignment" },
            ...classOptions,
          ]}
          error={errors.schoolClassId}
          disabled={classesQuery.isLoading}
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
          placeholder="Optional notes"
          error={errors.description}
          className="sm:col-span-2"
        />
        <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
          Credit hours must be greater than zero. A subject linked to teacher
          assignments, class assignments, or examinations cannot be archived.
        </Caption>
      </FormSection>

      <div className="mt-[var(--space-6)] flex flex-wrap justify-end gap-[var(--space-2)] border-t border-[var(--color-border-muted)] pt-[var(--space-4)]">
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
        <SubmitButton loading={saving} size="sm">
          {isEdit ? "Save Changes" : "Create Subject"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit subject drawer form.
 * Exported aliases: AddSubject, EditSubject
 */
export default function SubjectForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  subject = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${subject?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Subject" : "Add Subject"}
      description={
        isEdit
          ? "Update subject details, category, credits, or assignments."
          : "Create a new academic subject in the catalog."
      }
      size="md"
    >
      {open ? (
        <SubjectFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          subject={subject}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddSubject(props) {
  return <SubjectForm mode="create" {...props} />;
}

export function EditSubject(props) {
  return <SubjectForm mode="edit" {...props} />;
}
