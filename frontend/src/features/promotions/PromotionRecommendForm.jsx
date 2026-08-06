import { useEffect, useState } from "react";

import { FormGrid, FormSection, SelectField, TextField } from "../../components/form";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import {
  DECISION_OPTIONS,
  validateRecommendForm,
} from "./promotion.mappers";

const EMPTY = {
  academicYearId: "",
  termId: "",
  classId: "",
  toAcademicYearId: "",
  toClassId: "",
  decision: "",
  regenerate: false,
  remarks: "",
};

export default function PromotionRecommendForm({
  open,
  years = [],
  terms = [],
  classes = [],
  toYears = [],
  toClasses = [],
  loading = false,
  initialValues = null,
  onClose,
  onSubmit,
  onAcademicYearChange,
  onToAcademicYearChange,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY,
      academicYearId: initialValues?.academicYearId
        ? String(initialValues.academicYearId)
        : "",
      termId: initialValues?.termId ? String(initialValues.termId) : "",
      classId: initialValues?.classId ? String(initialValues.classId) : "",
      toAcademicYearId: initialValues?.toAcademicYearId
        ? String(initialValues.toAcademicYearId)
        : "",
    });
    setErrors({});
  }, [open, initialValues]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRecommendForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit?.({
      academicYearId: Number(form.academicYearId),
      termId: form.termId ? Number(form.termId) : undefined,
      classId: form.classId ? Number(form.classId) : undefined,
      toAcademicYearId: form.toAcademicYearId
        ? Number(form.toAcademicYearId)
        : undefined,
      toClassId: form.toClassId ? Number(form.toClassId) : undefined,
      decision: form.decision || undefined,
      regenerate: Boolean(form.regenerate),
      remarks: form.remarks || undefined,
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Recommend Promotions"
      description="Generate draft recommendations from published report cards. Preview → Approve → Execute."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Generate Recommendations
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[var(--space-5)]">
        <FormSection
          title="Source scope"
          description="Recommendations use published or locked report cards only."
        >
          <FormGrid>
            <SelectField
              label="Academic year"
              required
              value={form.academicYearId}
              error={errors.academicYearId}
              onChange={(event) => {
                setField("academicYearId", event.target.value);
                onAcademicYearChange?.(event.target.value);
              }}
              options={[
                { value: "", label: "Select academic year" },
                ...years.map((year) => ({
                  value: String(year.id),
                  label: year.name,
                })),
              ]}
            />
            <SelectField
              label="Term (optional)"
              value={form.termId}
              onChange={(event) => setField("termId", event.target.value)}
              options={[
                { value: "", label: "Latest published term" },
                ...terms.map((term) => ({
                  value: String(term.id),
                  label: term.name,
                })),
              ]}
            />
            <SelectField
              label="Class"
              required
              value={form.classId}
              error={errors.classId}
              onChange={(event) => setField("classId", event.target.value)}
              options={[
                { value: "", label: "Select class" },
                ...classes.map((item) => ({
                  value: String(item.id),
                  label: item.className
                    ? `${item.className} (${item.classCode})`
                    : item.classCode,
                })),
              ]}
            />
            <SelectField
              label="Force decision (optional)"
              value={form.decision}
              onChange={(event) => setField("decision", event.target.value)}
              options={[
                { value: "", label: "From report card / averages" },
                ...DECISION_OPTIONS,
              ]}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Destination"
          description="Continuation decisions enroll students into the next year class."
        >
          <FormGrid>
            <SelectField
              label="Destination academic year"
              value={form.toAcademicYearId}
              onChange={(event) => {
                setField("toAcademicYearId", event.target.value);
                onToAcademicYearChange?.(event.target.value);
              }}
              options={[
                { value: "", label: "Auto (next year)" },
                ...toYears.map((year) => ({
                  value: String(year.id),
                  label: year.name,
                })),
              ]}
            />
            <SelectField
              label="Default destination class"
              value={form.toClassId}
              onChange={(event) => setField("toClassId", event.target.value)}
              options={[
                { value: "", label: "Match class code / set later" },
                ...toClasses.map((item) => ({
                  value: String(item.id),
                  label: item.className
                    ? `${item.className} (${item.classCode})`
                    : item.classCode,
                })),
              ]}
            />
          </FormGrid>
          <TextField
            label="Remarks"
            value={form.remarks}
            onChange={(event) => setField("remarks", event.target.value)}
            placeholder="Optional batch remarks"
          />
          <label className="flex items-center gap-2 text-[length:var(--font-size-sm)]">
            <input
              type="checkbox"
              checked={form.regenerate}
              onChange={(event) => setField("regenerate", event.target.checked)}
            />
            Regenerate existing non-executed drafts
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}
