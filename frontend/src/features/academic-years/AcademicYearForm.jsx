import { useId, useState } from "react";

import {
  DatePickerField,
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import {
  createAcademicYear,
  updateAcademicYear,
} from "../../services/academic-years/academicYear.service";
import {
  ACADEMIC_YEAR_STATUS_OPTIONS,
  buildAcademicYearPayload,
  getApiErrorMessage,
  mapAcademicYearToForm,
  validateAcademicYearForm,
} from "./academicYear.mappers";

const INITIAL_FORM = {
  name: "",
  startDate: "",
  endDate: "",
  status: "Active",
};

function buildInitialForm(isEdit, academicYear) {
  const mapped =
    isEdit && academicYear ? mapAcademicYearToForm(academicYear) : null;
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

function AcademicYearFormBody({
  formId,
  isEdit,
  academicYear,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(isEdit, academicYear)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

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
    const nextErrors = validateAcademicYearForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildAcademicYearPayload(form);
      const response = isEdit
        ? await updateAcademicYear(academicYear.id, payload)
        : await createAcademicYear(payload);

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
          isEdit
            ? "Unable to update academic year."
            : "Unable to create academic year."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-[var(--space-6)]"
      >
        {submitError ? (
          <Alert variant="danger" title="Unable to save">
            {submitError}
          </Alert>
        ) : null}

        <FormSection
          title="Year details"
          description="Name must be unique across all academic years."
        >
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="e.g. 2026/2027"
            error={errors.name}
            required
            className="sm:col-span-2"
          />
          <DatePickerField
            label="Start date"
            name="startDate"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            error={errors.startDate}
            required
          />
          <DatePickerField
            label="End date"
            name="endDate"
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            error={errors.endDate}
            required
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            options={ACADEMIC_YEAR_STATUS_OPTIONS.map((item) => ({
              value: item,
              label: item,
            }))}
            error={errors.status}
            required
            className="sm:col-span-2"
          />
          <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
            Selecting Active automatically marks this as the current academic
            year and sets any other Active year to Inactive.
          </Caption>
        </FormSection>
      </form>

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
        <SubmitButton form={formId} loading={saving} size="sm">
          {isEdit ? "Save Changes" : "Create Academic Year"}
        </SubmitButton>
      </div>
    </>
  );
}

/**
 * Add / Edit academic year drawer form.
 * Exported aliases: AddAcademicYear, EditAcademicYear
 */
export default function AcademicYearForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  academicYear = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${academicYear?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Academic Year" : "Add Academic Year"}
      description={
        isEdit
          ? "Update academic year dates and status. Setting status to Active demotes any other active year."
          : "Create a new academic year. Only one Active academic year is allowed."
      }
      size="md"
    >
      {open ? (
        <AcademicYearFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          academicYear={academicYear}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddAcademicYear(props) {
  return <AcademicYearForm mode="create" {...props} />;
}

export function EditAcademicYear(props) {
  return <AcademicYearForm mode="edit" {...props} />;
}
