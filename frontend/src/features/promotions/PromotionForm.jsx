import { useEffect, useState } from "react";

import { FormGrid, FormSection, SelectField, TextField } from "../../components/form";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { DECISION_OPTIONS, validateEditForm } from "./promotion.mappers";

export default function PromotionForm({
  open,
  promotion = null,
  years = [],
  classes = [],
  loading = false,
  onClose,
  onSubmit,
  onToAcademicYearChange,
}) {
  const [form, setForm] = useState({
    decision: "",
    toAcademicYearId: "",
    toClassId: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open || !promotion) return;
    setForm({
      decision: promotion.decision || "",
      toAcademicYearId: promotion.toAcademicYearId
        ? String(promotion.toAcademicYearId)
        : "",
      toClassId: promotion.toClassId ? String(promotion.toClassId) : "",
      remarks: promotion.remarks || "",
    });
    setErrors({});
  }, [open, promotion]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateEditForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const continuation = ["PROMOTED", "PROMOTED_ON_PROBATION", "REPEAT"];
    await onSubmit?.({
      decision: form.decision,
      toAcademicYearId: continuation.includes(form.decision)
        ? Number(form.toAcademicYearId)
        : null,
      toClassId: continuation.includes(form.decision)
        ? Number(form.toClassId)
        : null,
      remarks: form.remarks || null,
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Promotion Decision"
      description={
        promotion
          ? `${promotion.studentName} · ${promotion.academicYearName}`
          : "Update decision and destination before approval."
      }
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save Decision
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[var(--space-5)]">
        <FormSection title="Decision">
          <FormGrid>
            <SelectField
              label="Promotion decision"
              required
              value={form.decision}
              error={errors.decision}
              onChange={(event) => setField("decision", event.target.value)}
              options={[
                { value: "", label: "Select decision" },
                ...DECISION_OPTIONS,
              ]}
            />
            <SelectField
              label="Destination academic year"
              value={form.toAcademicYearId}
              error={errors.toAcademicYearId}
              onChange={(event) => {
                setField("toAcademicYearId", event.target.value);
                onToAcademicYearChange?.(event.target.value);
              }}
              options={[
                { value: "", label: "Select year (or none for exits)" },
                ...years.map((year) => ({
                  value: String(year.id),
                  label: year.name,
                })),
              ]}
            />
            <SelectField
              label="Destination class"
              value={form.toClassId}
              error={errors.toClassId}
              onChange={(event) => setField("toClassId", event.target.value)}
              options={[
                { value: "", label: "Select class (or none for exits)" },
                ...classes.map((item) => ({
                  value: String(item.id),
                  label: item.className
                    ? `${item.className} (${item.classCode})`
                    : item.classCode,
                })),
              ]}
            />
            <TextField
              label="Remarks"
              value={form.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
            />
          </FormGrid>
        </FormSection>
      </form>
    </Drawer>
  );
}
