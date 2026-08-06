import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import { getEnrollments } from "../../services/enrollments/enrollment.service";
import {
  generateReportCard,
  generateReportCardsBulk,
  getReportCardTemplates,
} from "../../services/report-cards/reportCard.service";
import { getTerms } from "../../services/terms/term.service";
import { cn } from "../../utils/cn";
import {
  buildBulkGeneratePayload,
  buildGeneratePayload,
  formatClassLabel,
  formatStudentName,
  getApiErrorMessage,
  PROMOTION_OPTIONS,
  validateGenerateForm,
} from "./reportCard.mappers";

function RemarksArea({ label, value, onChange, name }) {
  return (
    <div className="ds-field mb-5">
      <label htmlFor={name} className={fieldLabelClassName}>
        {label}
      </label>
      <div className={cn(fieldShellState({}))}>
        <textarea
          id={name}
          name={name}
          rows={3}
          value={value}
          onChange={onChange}
          className={textareaControlClassName}
        />
      </div>
    </div>
  );
}

function ReportCardGenerateFormBody({
  defaults = {},
  mode = "single",
  onClose,
  onSuccess,
}) {
  const bulk = mode === "bulk";
  const [form, setForm] = useState({
    academicYearId: defaults.academicYearId || "",
    termId: defaults.termId || "",
    classId: defaults.classId || "",
    studentId: defaults.studentId || "",
    templateKey: defaults.templateKey || "STANDARD_A4",
    teacherRemarks: "",
    headmasterRemarks: "",
    promotionDecision: "PENDING",
    regenerate: false,
    asDraft: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "report-card-generate"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "report-card-generate", form.academicYearId],
    queryFn: async () => {
      const response = await getTerms({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(form.academicYearId),
  });

  const classesQuery = useQuery({
    queryKey: ["classes", "report-card-generate", form.academicYearId],
    queryFn: async () => {
      const response = await getClasses({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(form.academicYearId),
  });

  const templatesQuery = useQuery({
    queryKey: ["report-card-templates"],
    queryFn: async () => {
      const response = await getReportCardTemplates();
      return response?.data ?? [];
    },
  });

  const enrollmentsQuery = useQuery({
    queryKey: [
      "enrollments",
      "report-card-generate",
      form.academicYearId,
      form.classId,
    ],
    queryFn: async () => {
      const response = await getEnrollments({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
        classId: form.classId || undefined,
        status: "ACTIVE",
      });
      return response?.data ?? [];
    },
    enabled: !bulk && Boolean(form.academicYearId && form.classId),
  });

  const studentOptions = (enrollmentsQuery.data || [])
    .map((enrollment) => enrollment.student)
    .filter(Boolean);

  const templateOptions = (templatesQuery.data || []).map((tpl) => ({
    value: tpl.key,
    label: tpl.name || tpl.key,
  }));

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateGenerateForm(form, { bulk });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      if (bulk) {
        const result = await generateReportCardsBulk(
          buildBulkGeneratePayload(form)
        );
        onSuccess?.(result);
      } else {
        const result = await generateReportCard(buildGeneratePayload(form));
        onSuccess?.(result);
      }
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          bulk
            ? "Unable to bulk-generate report cards."
            : "Unable to generate report card. Ensure results are published."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-[var(--space-5)]" onSubmit={handleSubmit}>
      {submitError ? <Alert variant="error" message={submitError} /> : null}

      <FormSection
        title="Scope"
        description="Report cards are generated only from published or locked results."
      >
        <FormGrid>
          <SelectField
            label="Academic Year"
            required
            value={form.academicYearId}
            error={errors.academicYearId}
            onChange={(event) => {
              setField("academicYearId", event.target.value);
              setField("termId", "");
              setField("classId", "");
              setField("studentId", "");
            }}
            options={(yearsQuery.data || []).map((year) => ({
              value: String(year.id),
              label: year.name,
            }))}
            placeholder="Select year"
          />
          <SelectField
            label="Term"
            required
            value={form.termId}
            error={errors.termId}
            onChange={(event) => setField("termId", event.target.value)}
            options={(termsQuery.data || []).map((term) => ({
              value: String(term.id),
              label: term.name,
            }))}
            placeholder="Select term"
            disabled={!form.academicYearId}
          />
          <SelectField
            label="Class"
            required
            value={form.classId}
            error={errors.classId}
            onChange={(event) => {
              setField("classId", event.target.value);
              setField("studentId", "");
            }}
            options={(classesQuery.data || []).map((item) => ({
              value: String(item.id),
              label: formatClassLabel(item),
            }))}
            placeholder="Select class"
            disabled={!form.academicYearId}
          />
          {!bulk ? (
            <SelectField
              label="Student"
              required
              value={form.studentId}
              error={errors.studentId}
              onChange={(event) => setField("studentId", event.target.value)}
              options={studentOptions.map((student) => ({
                value: String(student.id),
                label: `${formatStudentName(student)} (${student.admissionNo})`,
              }))}
              placeholder={
                form.classId
                  ? enrollmentsQuery.isLoading
                    ? "Loading students…"
                    : "Select student"
                  : "Select class first"
              }
              disabled={!form.classId || enrollmentsQuery.isLoading}
            />
          ) : null}
          <SelectField
            label="Template"
            value={form.templateKey}
            onChange={(event) => setField("templateKey", event.target.value)}
            options={
              templateOptions.length
                ? templateOptions
                : [
                    {
                      value: "STANDARD_A4",
                      label: "Standard A4 (enterprise)",
                    },
                  ]
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
      </FormSection>

      <FormSection
        title="Remarks"
        description="Optional remarks are frozen into the academic snapshot."
      >
        <FormGrid>
          <RemarksArea
            name="teacherRemarks"
            label="Teacher Remarks"
            value={form.teacherRemarks}
            onChange={(event) => setField("teacherRemarks", event.target.value)}
          />
          <RemarksArea
            name="headmasterRemarks"
            label="Headmaster Remarks"
            value={form.headmasterRemarks}
            onChange={(event) =>
              setField("headmasterRemarks", event.target.value)
            }
          />
        </FormGrid>
        <div className="mt-[var(--space-3)] flex flex-col gap-2">
          <Checkbox
            id="report-card-regenerate"
            checked={form.regenerate}
            onChange={(event) => setField("regenerate", event.target.checked)}
            label="Regenerate if a report card already exists"
          />
          <Checkbox
            id="report-card-as-draft"
            checked={form.asDraft}
            onChange={(event) => setField("asDraft", event.target.checked)}
            label="Save as draft workflow status"
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-[var(--space-3)]">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton loading={saving}>
          {bulk ? "Generate Class Cards" : "Generate Report Card"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default function ReportCardGenerateForm({
  open,
  mode = "single",
  defaults = {},
  onClose,
  onSuccess,
}) {
  const bulk = mode === "bulk";
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={bulk ? "Bulk Generate Report Cards" : "Generate Report Card"}
      description={
        bulk
          ? "Create official report card snapshots for every enrolled student in the class."
          : "Create an official report card snapshot from published results."
      }
      size="lg"
    >
      {open ? (
        <ReportCardGenerateFormBody
          key={`${mode}-${defaults.academicYearId}-${defaults.classId}-${defaults.studentId}`}
          defaults={defaults}
          mode={mode}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}
