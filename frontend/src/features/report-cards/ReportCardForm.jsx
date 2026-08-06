import { useState } from "react";

import {
  FormGrid,
  FormSection,
  SelectField,
  SubmitButton,
} from "../../components/form";
import {
  fieldLabelClassName,
  fieldShellState,
  textareaControlClassName,
} from "../../components/form/fieldStyles";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import Drawer from "../../components/ui/Drawer";
import { updateReportCard } from "../../services/report-cards/reportCard.service";
import { cn } from "../../utils/cn";
import {
  getApiErrorMessage,
  PROMOTION_OPTIONS,
  validateRemarksForm,
} from "./reportCard.mappers";

function RemarksArea({ label, value, onChange, name, error }) {
  return (
    <div className="ds-field mb-5">
      <label htmlFor={name} className={fieldLabelClassName}>
        {label}
      </label>
      <div className={cn(fieldShellState({ error: Boolean(error) }))}>
        <textarea
          id={name}
          name={name}
          rows={4}
          value={value}
          onChange={onChange}
          className={textareaControlClassName}
        />
      </div>
      {error ? (
        <p className="ds-field__error mt-1 text-[length:var(--font-size-xs)] text-[var(--color-danger-500)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReportCardFormBody({ reportCard, onClose, onSuccess }) {
  const [form, setForm] = useState({
    teacherRemarks: reportCard?.teacherRemarks || "",
    headmasterRemarks: reportCard?.headmasterRemarks || "",
    promotionDecision: reportCard?.promotionDecision || "PENDING",
    refreshSnapshot: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRemarksForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      const result = await updateReportCard(reportCard.id, {
        teacherRemarks: form.teacherRemarks.trim() || null,
        headmasterRemarks: form.headmasterRemarks.trim() || null,
        promotionDecision: form.promotionDecision,
        refreshSnapshot: Boolean(form.refreshSnapshot),
      });
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Unable to update report card.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-[var(--space-5)]" onSubmit={handleSubmit}>
      {submitError ? <Alert variant="error" message={submitError} /> : null}

      <FormSection
        title="Academic remarks"
        description={`${reportCard?.studentName || "Student"} · ${reportCard?.termName || "Term"}`}
      >
        <FormGrid>
          <RemarksArea
            name="teacherRemarks"
            label="Teacher Remarks"
            value={form.teacherRemarks}
            error={errors.teacherRemarks}
            onChange={(event) => setField("teacherRemarks", event.target.value)}
          />
          <RemarksArea
            name="headmasterRemarks"
            label="Headmaster Remarks"
            value={form.headmasterRemarks}
            error={errors.headmasterRemarks}
            onChange={(event) =>
              setField("headmasterRemarks", event.target.value)
            }
          />
          <SelectField
            label="Promotion Decision"
            value={form.promotionDecision}
            onChange={(event) =>
              setField("promotionDecision", event.target.value)
            }
            options={PROMOTION_OPTIONS}
          />
        </FormGrid>
        <Checkbox
          id="report-card-refresh-snapshot"
          checked={form.refreshSnapshot}
          onChange={(event) => setField("refreshSnapshot", event.target.checked)}
          label="Refresh academic snapshot from latest published results"
        />
      </FormSection>

      <div className="flex items-center justify-end gap-[var(--space-3)]">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton loading={saving}>Save Report Card</SubmitButton>
      </div>
    </form>
  );
}

export default function ReportCardForm({
  open,
  reportCard,
  onClose,
  onSuccess,
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Report Card"
      description="Update remarks and promotion decision. Locked cards require Administrator access."
      size="lg"
    >
      {open && reportCard ? (
        <ReportCardFormBody
          key={reportCard.id}
          reportCard={reportCard}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}
