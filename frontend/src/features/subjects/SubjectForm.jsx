import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  FormGridFull,
  FormSection,
  SelectField,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Caption } from "../../components/ui/Typography";
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
  getApiFieldErrors,
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

function buildInitialForm(subject) {
  const mapped = subject ? mapSubjectToForm(subject) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function SubjectFormBody({
  formId,
  subject,
  onClose,
  onSuccess,
  saving,
  setSaving,
}) {
  // Lock the record id at mount. Remount via key when switching create/edit.
  // Save path depends ONLY on this id — never on a parent "mode" flag.
  const [editingId] = useState(() =>
    subject?.id != null && subject.id !== "" ? String(subject.id) : null
  );
  const isUpdate = Boolean(editingId);

  const [form, setForm] = useState(() => buildInitialForm(subject));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

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
    event.stopPropagation();

    const nextErrors = validateSubjectForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildSubjectPayload(form);
      if (isUpdate) {
        const response = await updateSubject(editingId, payload);
        onSuccess?.(response?.data, response?.message, "update");
      } else {
        const response = await createSubject(payload);
        onSuccess?.(response?.data, response?.message, "create");
      }
      onClose?.();
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(
        getApiErrorMessage(
          error,
          isUpdate ? "Unable to update subject." : "Unable to create subject."
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
      {isUpdate ? (
        <input type="hidden" name="id" value={editingId} readOnly />
      ) : null}

      {submitError ? (
        <Alert variant="error" title="Unable to save" message={submitError} />
      ) : null}

      {Object.keys(errors).length > 0 && !submitError ? (
        <Alert
          variant="error"
          message="Please correct the highlighted fields before saving."
        />
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
          disabled={saving}
        />
        <TextField
          label="Subject name"
          name="subjectName"
          value={form.subjectName}
          onChange={(event) => updateField("subjectName", event.target.value)}
          placeholder="e.g. Core Mathematics"
          error={errors.subjectName}
          required
          disabled={saving}
        />
        <TextField
          label="Short name"
          name="shortName"
          value={form.shortName}
          onChange={(event) => updateField("shortName", event.target.value)}
          placeholder="e.g. Math"
          error={errors.shortName}
          required
          disabled={saving}
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
          disabled={saving}
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
          disabled={saving}
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
          disabled={saving}
        />
        <SelectField
          label="Department"
          name="departmentId"
          value={form.departmentId}
          onChange={(event) =>
            updateField("departmentId", event.target.value)
          }
          options={departmentOptions}
          placeholder="No department"
          error={errors.departmentId}
          disabled={saving || departmentsQuery.isLoading}
        />
        <SelectField
          label="Assigned class"
          name="schoolClassId"
          value={form.schoolClassId}
          onChange={(event) =>
            updateField("schoolClassId", event.target.value)
          }
          options={classOptions}
          placeholder="No class assignment"
          error={errors.schoolClassId}
          disabled={saving || classesQuery.isLoading}
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
            disabled={saving}
          />
        </FormGridFull>
        <FormGridFull>
          <Caption variant="muted" size="sm" className="m-0">
            Credit hours must be greater than zero. A subject linked to teacher
            or class allocations, assessments, examinations, results, or
            timetables cannot be archived.
          </Caption>
        </FormGridFull>
      </FormSection>
    </form>
  );
}

/**
 * Add / Edit subject drawer form.
 * Create vs update is decided solely by whether `subject.id` is present
 * when the form body mounts (see editingId).
 * Exported aliases: AddSubject, EditSubject
 */
export default function SubjectForm({
  open,
  onClose,
  onSuccess,
  subject = null,
}) {
  const reactId = useId();
  const formId = `subject-drawer-form-${reactId.replace(/:/g, "")}`;
  const [saving, setSaving] = useState(false);
  const recordId =
    subject?.id != null && subject.id !== "" ? String(subject.id) : null;
  const isUpdate = Boolean(recordId);
  const instanceKey = `${recordId ?? "new"}:${open ? "open" : "closed"}`;

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={isUpdate ? "Edit Subject" : "Add Subject"}
      description={
        isUpdate
          ? "Update subject details, category, credits, or assignments."
          : "Create a new academic subject in the catalog."
      }
      size="md"
      disabled={saving}
      footer={
        <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            size="sm"
            className="w-auto"
            loading={saving}
            disabled={saving}
          >
            {isUpdate ? "Save Changes" : "Create Subject"}
          </Button>
        </div>
      }
    >
      {open ? (
        <SubjectFormBody
          key={instanceKey}
          formId={formId}
          subject={subject}
          onClose={handleClose}
          onSuccess={onSuccess}
          saving={saving}
          setSaving={setSaving}
        />
      ) : null}
    </Drawer>
  );
}

export function AddSubject(props) {
  return <SubjectForm subject={null} {...props} />;
}

export function EditSubject({ subject, ...props }) {
  return <SubjectForm subject={subject} {...props} />;
}
