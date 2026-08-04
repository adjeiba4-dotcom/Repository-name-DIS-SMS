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
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  createClass,
  updateClass,
} from "../../services/classes/class.service";
import { getDepartments } from "../../services/departments/department.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import {
  CLASS_STATUS_OPTIONS,
  buildClassPayload,
  getApiErrorMessage,
  mapClassToForm,
  teacherDisplayName,
  validateClassForm,
} from "./class.mappers";

const INITIAL_FORM = {
  classCode: "",
  className: "",
  academicYearId: "",
  departmentId: "",
  classTeacherId: "",
  capacity: "",
  description: "",
  status: "Active",
};

function buildInitialForm(isEdit, schoolClass) {
  const mapped = isEdit && schoolClass ? mapClassToForm(schoolClass) : null;
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

function ClassFormBody({ formId, isEdit, schoolClass, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildInitialForm(isEdit, schoolClass));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "class-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", "class-form-options"],
    queryFn: async () => {
      const response = await getDepartments();
      return response?.data ?? [];
    },
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "class-form-options"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const yearOptions = (yearsQuery.data ?? []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }));

  const departmentOptions = (departmentsQuery.data ?? []).map((dept) => ({
    value: String(dept.id),
    label: dept.name,
  }));

  const teacherOptions = (teachersQuery.data ?? []).map((teacher) => ({
    value: String(teacher.id),
    label: teacherDisplayName(teacher) || `Teacher #${teacher.id}`,
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
    const nextErrors = validateClassForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildClassPayload(form);
      const response = isEdit
        ? await updateClass(schoolClass.id, payload)
        : await createClass(payload);

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
          isEdit ? "Unable to update class." : "Unable to create class."
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
        title="Class details"
        description="Class code must be unique within the selected academic year."
      >
        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) =>
            updateField("academicYearId", event.target.value)
          }
          options={[
            { value: "", label: "Select academic year" },
            ...yearOptions,
          ]}
          error={errors.academicYearId}
          required
          className="sm:col-span-2"
          disabled={yearsQuery.isLoading}
        />
        <TextField
          label="Class code"
          name="classCode"
          value={form.classCode}
          onChange={(event) => updateField("classCode", event.target.value)}
          placeholder="e.g. SHS1A"
          error={errors.classCode}
          required
        />
        <TextField
          label="Class name"
          name="className"
          value={form.className}
          onChange={(event) => updateField("className", event.target.value)}
          placeholder="e.g. SHS 1 Science A"
          error={errors.className}
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
          label="Class teacher"
          name="classTeacherId"
          value={form.classTeacherId}
          onChange={(event) =>
            updateField("classTeacherId", event.target.value)
          }
          options={[
            { value: "", label: "No class teacher" },
            ...teacherOptions,
          ]}
          error={errors.classTeacherId}
          disabled={teachersQuery.isLoading}
        />
        <TextField
          label="Capacity"
          name="capacity"
          type="number"
          min="1"
          value={form.capacity}
          onChange={(event) => updateField("capacity", event.target.value)}
          placeholder="e.g. 45"
          error={errors.capacity}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={CLASS_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
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
          Capacity must be greater than zero. A class with enrolled students
          cannot be archived.
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
          {isEdit ? "Save Changes" : "Create Class"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit class drawer form.
 * Exported aliases: AddClass, EditClass
 */
export default function ClassForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  schoolClass = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${schoolClass?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Class" : "Add Class"}
      description={
        isEdit
          ? "Update class details, capacity, department, or class teacher."
          : "Create a new school class under an academic year."
      }
      size="md"
    >
      {open ? (
        <ClassFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          schoolClass={schoolClass}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddClass(props) {
  return <ClassForm mode="create" {...props} />;
}

export function EditClass(props) {
  return <ClassForm mode="edit" {...props} />;
}
