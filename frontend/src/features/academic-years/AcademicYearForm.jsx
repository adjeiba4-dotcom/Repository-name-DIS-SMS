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

function buildInitialForm(academicYear) {
  const mapped = academicYear ? mapAcademicYearToForm(academicYear) : null;
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
  academicYear,
  onClose,
  onSuccess,
}) {
  // Lock the record id at mount. Remount via key when switching create/edit.
  // Save path depends ONLY on this id — never on a parent "mode" flag.
  const [editingId] = useState(() =>
    academicYear?.id != null && academicYear.id !== ""
      ? String(academicYear.id)
      : null
  );
  const isUpdate = Boolean(editingId);

  const [form, setForm] = useState(() => buildInitialForm(academicYear));
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
    event.stopPropagation();

    const nextErrors = validateAcademicYearForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    const payload = buildAcademicYearPayload(form);

    setSaving(true);
    try {
      if (isUpdate) {
        const response = await updateAcademicYear(editingId, payload);
        onSuccess?.(response?.data, response?.message, "update");
      } else {
        const response = await createAcademicYear(payload);
        onSuccess?.(response?.data, response?.message, "create");
      }
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isUpdate
            ? "Unable to update academic year."
            : "Unable to create academic year."
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
        title="Year details"
        description={
          isUpdate
            ? "Update the selected academic year. The existing name can be kept."
            : "Name must be unique across all academic years."
        }
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
          disabled={saving}
        />
        <DatePickerField
          label="Start date"
          name="startDate"
          value={form.startDate}
          onChange={(event) => updateField("startDate", event.target.value)}
          error={errors.startDate}
          required
          disabled={saving}
        />
        <DatePickerField
          label="End date"
          name="endDate"
          value={form.endDate}
          onChange={(event) => updateField("endDate", event.target.value)}
          error={errors.endDate}
          required
          disabled={saving}
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
          disabled={saving}
        />
        <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
          Selecting Active automatically marks this as the current academic
          year and sets any other Active year to Inactive.
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
          {isUpdate ? "Save Changes" : "Create Academic Year"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit academic year drawer.
 * Create vs update is decided solely by whether `academicYear.id` is present
 * when the form body mounts (see editingId). Parent must pass the record
 * atomically with open=true for edits.
 */
export default function AcademicYearForm({
  open,
  onClose,
  onSuccess,
  academicYear = null,
}) {
  const formId = useId();
  const recordId =
    academicYear?.id != null && academicYear.id !== ""
      ? String(academicYear.id)
      : null;
  const isUpdate = Boolean(recordId);
  const instanceKey = `${recordId ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isUpdate ? "Edit Academic Year" : "Add Academic Year"}
      description={
        isUpdate
          ? "Update academic year dates and status. Setting status to Active demotes any other active year."
          : "Create a new academic year. Only one Active academic year is allowed."
      }
      size="md"
    >
      {open ? (
        <AcademicYearFormBody
          key={instanceKey}
          formId={formId}
          academicYear={academicYear}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddAcademicYear(props) {
  return <AcademicYearForm academicYear={null} {...props} />;
}

export function EditAcademicYear({ academicYear, ...props }) {
  return <AcademicYearForm academicYear={academicYear} {...props} />;
}
