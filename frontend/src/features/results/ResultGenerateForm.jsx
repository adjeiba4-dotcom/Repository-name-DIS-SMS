import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  FormGridFull,
  FormSection,
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import Drawer from "../../components/ui/Drawer";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import { getExaminations } from "../../services/examinations/examination.service";
import { generateResults } from "../../services/results/result.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTerms } from "../../services/terms/term.service";
import {
  buildGeneratePayload,
  formatClassLabel,
  formatSubjectLabel,
  getApiErrorMessage,
  validateGenerateForm,
} from "./result.mappers";

function ResultGenerateFormBody({ defaults = {}, onClose, onSuccess }) {
  const [form, setForm] = useState({
    academicYearId: defaults.academicYearId || "",
    termId: defaults.termId || "",
    classId: defaults.classId || "",
    subjectId: defaults.subjectId || "",
    examinationId: "",
    regenerate: false,
    asDraft: false,
    caWeight: "",
    examWeight: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "result-generate"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "result-generate", form.academicYearId],
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
    queryKey: ["classes", "result-generate", form.academicYearId],
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

  const subjectsQuery = useQuery({
    queryKey: ["subjects", "result-generate"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const examinationsQuery = useQuery({
    queryKey: [
      "examinations",
      "result-generate",
      form.academicYearId,
      form.termId,
      form.classId,
      form.subjectId,
    ],
    queryFn: async () => {
      const response = await getExaminations({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
        termId: form.termId || undefined,
        classId: form.classId || undefined,
        subjectId: form.subjectId || undefined,
        isLocked: true,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(
      form.academicYearId && form.termId && form.classId && form.subjectId
    ),
  });

  const yearOptions = (yearsQuery.data || []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }));
  const termOptions = (termsQuery.data || []).map((term) => ({
    value: String(term.id),
    label: term.name || term.code,
  }));
  const classOptions = (classesQuery.data || []).map((item) => ({
    value: String(item.id),
    label: formatClassLabel(item),
  }));
  const subjectOptions = (subjectsQuery.data || []).map((item) => ({
    value: String(item.id),
    label: formatSubjectLabel(item),
  }));
  const examinationOptions = (examinationsQuery.data || []).map((item) => ({
    value: String(item.id),
    label: `${item.name || item.examinationType} · ${item.examinationType}`,
  }));

  const updateField = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "academicYearId") {
        next.termId = "";
        next.classId = "";
        next.examinationId = "";
      }
      if (["termId", "classId", "subjectId"].includes(name)) {
        next.examinationId = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateGenerateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      const response = await generateResults(buildGeneratePayload(form));
      onSuccess?.(
        response?.message || "Results generated successfully.",
        response?.data
      );
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Unable to generate results.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-[var(--space-6)]" onSubmit={handleSubmit}>
      {submitError ? (
        <Alert variant="error" title="Generation failed">
          {submitError}
        </Alert>
      ) : null}

      <Alert variant="info" title="Generation rules">
        Results combine Continuous Assessment and Examination scores using
        System Settings weights (default 40% CA / 60% Exam). The source
        examination must be locked, assessments must exist, and only enrolled
        students are included.
      </Alert>

      <FormSection title="Scope" description="Select the class subject to generate.">
        <FormGridFull>
          <SelectField
            label="Academic year"
            name="academicYearId"
            value={form.academicYearId}
            onChange={(event) => updateField("academicYearId", event.target.value)}
            options={[
              { value: "", label: "Select academic year" },
              ...yearOptions,
            ]}
            error={errors.academicYearId}
            required
          />
          <SelectField
            label="Term"
            name="termId"
            value={form.termId}
            onChange={(event) => updateField("termId", event.target.value)}
            options={[{ value: "", label: "Select term" }, ...termOptions]}
            error={errors.termId}
            required
            disabled={!form.academicYearId}
          />
          <SelectField
            label="Class"
            name="classId"
            value={form.classId}
            onChange={(event) => updateField("classId", event.target.value)}
            options={[{ value: "", label: "Select class" }, ...classOptions]}
            error={errors.classId}
            required
            disabled={!form.academicYearId}
          />
          <SelectField
            label="Subject"
            name="subjectId"
            value={form.subjectId}
            onChange={(event) => updateField("subjectId", event.target.value)}
            options={[
              { value: "", label: "Select subject" },
              ...subjectOptions,
            ]}
            error={errors.subjectId}
            required
          />
          <SelectField
            label="Locked examination"
            name="examinationId"
            value={form.examinationId}
            onChange={(event) =>
              updateField("examinationId", event.target.value)
            }
            options={[
              { value: "", label: "Auto-select preferred locked exam" },
              ...examinationOptions,
            ]}
            helperText="Leave blank to use the latest locked END_OF_TERM / FINAL examination."
            disabled={
              !form.academicYearId ||
              !form.termId ||
              !form.classId ||
              !form.subjectId
            }
          />
          <TextField
            label="CA weight override (%)"
            name="caWeight"
            type="number"
            value={form.caWeight}
            onChange={(event) => updateField("caWeight", event.target.value)}
            helperText="Optional. Leave blank to use System Settings (default 40%)."
          />
          <TextField
            label="Exam weight override (%)"
            name="examWeight"
            type="number"
            value={form.examWeight}
            onChange={(event) => updateField("examWeight", event.target.value)}
            helperText="Optional. Must total 100 with CA when both are set (default 60%)."
          />
          <Checkbox
            id="result-regenerate"
            label="Regenerate existing unlocked results for this scope"
            checked={form.regenerate}
            onChange={(event) =>
              updateField("regenerate", event.target.checked)
            }
          />
          <Checkbox
            id="result-as-draft"
            label="Save as Draft (skip Generated; verify later)"
            checked={form.asDraft}
            onChange={(event) => updateField("asDraft", event.target.checked)}
          />
        </FormGridFull>
      </FormSection>

      <div className="flex justify-end gap-[var(--space-2)]">
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
        <SubmitButton loading={saving}>Generate Results</SubmitButton>
      </div>
    </form>
  );
}

export default function ResultGenerateForm({
  open,
  defaults = {},
  onClose,
  onSuccess,
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Generate Results"
      description="Build final scores from Continuous Assessment and locked examination marks."
      size="lg"
    >
      {open ? (
        <ResultGenerateFormBody
          key={`${defaults.academicYearId}-${defaults.termId}-${defaults.classId}-${defaults.subjectId}`}
          defaults={defaults}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}
