import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  createTerm,
  updateTerm,
} from "../../services/terms/term.service";
import {
  TERM_STATUS_OPTIONS,
  buildTermPayload,
  getApiErrorMessage,
  mapTermToForm,
  validateTermForm,
} from "./term.mappers";

const INITIAL_FORM = {
  academicYearId: "",
  code: "",
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "Active",
};

function buildInitialForm(isEdit, term) {
  const mapped = isEdit && term ? mapTermToForm(term) : null;
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

function TermFormBody({ formId, isEdit, term, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildInitialForm(isEdit, term));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "term-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const yearOptions = (yearsQuery.data ?? []).map((year) => ({
    value: String(year.id),
    label: year.name,
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
    const nextErrors = validateTermForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildTermPayload(form);
      const response = isEdit
        ? await updateTerm(term.id, payload)
        : await createTerm(payload);

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
          isEdit ? "Unable to update term." : "Unable to create term."
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
        title="Term details"
        description="Code and name must be unique within the selected academic year."
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
          label="Code"
          name="code"
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
          placeholder="e.g. T1"
          error={errors.code}
          required
        />
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="e.g. First Term"
          error={errors.name}
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
          options={TERM_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
          className="sm:col-span-2"
        />
        <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
          Selecting Active marks this as the current term and sets any other
          Active term to Inactive. Dates must fall within the academic year
          and must not overlap other terms in that year.
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
          {isEdit ? "Save Changes" : "Create Term"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit term drawer form.
 * Exported aliases: AddTerm, EditTerm
 */
export default function TermForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  term = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${term?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Term" : "Add Term"}
      description={
        isEdit
          ? "Update term dates and status. Setting status to Active demotes any other active term."
          : "Create a new term under an academic year. Only one Active term is allowed."
      }
      size="md"
    >
      {open ? (
        <TermFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          term={term}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddTerm(props) {
  return <TermForm mode="create" {...props} />;
}

export function EditTerm(props) {
  return <TermForm mode="edit" {...props} />;
}
