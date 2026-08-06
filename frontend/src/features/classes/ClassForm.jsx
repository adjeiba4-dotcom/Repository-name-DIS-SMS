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
  getApiFieldErrors,
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

function buildInitialForm(schoolClass) {
  const mapped = schoolClass ? mapClassToForm(schoolClass) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function ClassFormBody({
  formId,
  schoolClass,
  onClose,
  onSuccess,
  saving,
  setSaving,
}) {
  // Lock the record id at mount. Remount via key when switching create/edit.
  // Save path depends ONLY on this id — never on a parent "mode" flag.
  const [editingId] = useState(() =>
    schoolClass?.id != null && schoolClass.id !== ""
      ? String(schoolClass.id)
      : null
  );
  const isUpdate = Boolean(editingId);

  const [form, setForm] = useState(() => buildInitialForm(schoolClass));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

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
    event.stopPropagation();

    const nextErrors = validateClassForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    const payload = buildClassPayload(form);
    if (
      !Number.isInteger(payload.academicYearId) ||
      payload.academicYearId < 1
    ) {
      setErrors({ academicYearId: "Academic year is required." });
      return;
    }

    setSaving(true);
    try {
      if (isUpdate) {
        const response = await updateClass(editingId, payload);
        onSuccess?.(response?.data, response?.message, "update");
      } else {
        const response = await createClass(payload);
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
          isUpdate ? "Unable to update class." : "Unable to create class."
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
        title="Class details"
        description="Class code must be unique within the selected academic year."
      >
        <FormGridFull>
          <SelectField
            label="Academic year"
            name="academicYearId"
            value={form.academicYearId}
            onChange={(event) =>
              updateField("academicYearId", event.target.value)
            }
            options={yearOptions}
            placeholder="Select academic year"
            error={errors.academicYearId}
            required
            disabled={saving || yearsQuery.isLoading}
          />
        </FormGridFull>
        <TextField
          label="Class code"
          name="classCode"
          value={form.classCode}
          onChange={(event) => updateField("classCode", event.target.value)}
          placeholder="e.g. SHS1A"
          error={errors.classCode}
          required
          disabled={saving}
        />
        <TextField
          label="Class name"
          name="className"
          value={form.className}
          onChange={(event) => updateField("className", event.target.value)}
          placeholder="e.g. SHS 1 Science A"
          error={errors.className}
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
          label="Class teacher"
          name="classTeacherId"
          value={form.classTeacherId}
          onChange={(event) =>
            updateField("classTeacherId", event.target.value)
          }
          options={teacherOptions}
          placeholder="No class teacher"
          error={errors.classTeacherId}
          disabled={saving || teachersQuery.isLoading}
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
          disabled={saving}
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
          disabled={saving}
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
            Capacity must be greater than zero. A class with enrolled students
            cannot be archived.
          </Caption>
        </FormGridFull>
      </FormSection>
    </form>
  );
}

/**
 * Add / Edit class drawer form.
 * Create vs update is decided solely by whether `schoolClass.id` is present
 * when the form body mounts (see editingId).
 * Exported aliases: AddClass, EditClass
 */
export default function ClassForm({
  open,
  onClose,
  onSuccess,
  schoolClass = null,
}) {
  const reactId = useId();
  const formId = `class-drawer-form-${reactId.replace(/:/g, "")}`;
  const [saving, setSaving] = useState(false);
  const recordId =
    schoolClass?.id != null && schoolClass.id !== ""
      ? String(schoolClass.id)
      : null;
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
      title={isUpdate ? "Edit Class" : "Add Class"}
      description={
        isUpdate
          ? "Update class details, capacity, department, or class teacher."
          : "Create a new school class under an academic year."
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
            {isUpdate ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      }
    >
      {open ? (
        <ClassFormBody
          key={instanceKey}
          formId={formId}
          schoolClass={schoolClass}
          onClose={handleClose}
          onSuccess={onSuccess}
          saving={saving}
          setSaving={setSaving}
        />
      ) : null}
    </Drawer>
  );
}

export function AddClass(props) {
  return <ClassForm schoolClass={null} {...props} />;
}

export function EditClass({ schoolClass, ...props }) {
  return <ClassForm schoolClass={schoolClass} {...props} />;
}
