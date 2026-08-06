import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  DatePickerField,
  FormGridFull,
  FormSection,
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  createAssessment,
  updateAssessment,
} from "../../services/assessments/assessment.service";
import { getClasses } from "../../services/classes/class.service";
import { getClassSubjects } from "../../services/class-subjects/classSubject.service";
import { getTerms } from "../../services/terms/term.service";
import {
  ASSESSMENT_STATUS_OPTIONS,
  ASSESSMENT_TYPE_OPTIONS,
  buildAssessmentPayload,
  formatClassLabel,
  formatSubjectLabel,
  formatTeacherName,
  getApiErrorMessage,
  mapAssessmentToForm,
  todayDateInputValue,
  validateAssessmentForm,
} from "./assessment.mappers";

const INITIAL_FORM = {
  title: "",
  academicYearId: "",
  termId: "",
  classId: "",
  subjectId: "",
  teacherId: "",
  assessmentType: "CLASS_WORK",
  maxMarks: "100",
  assessmentDate: todayDateInputValue(),
  remarks: "",
  status: "Active",
};

function buildInitialForm(isEdit, assessment) {
  const mapped = isEdit && assessment ? mapAssessmentToForm(assessment) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function AssessmentFormBody({
  formId,
  isEdit,
  assessment,
  defaults = {},
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() => {
    const initial = buildInitialForm(isEdit, assessment);
    return {
      ...initial,
      academicYearId: initial.academicYearId || defaults.academicYearId || "",
      termId: initial.termId || defaults.termId || "",
      classId: initial.classId || defaults.classId || "",
      subjectId: initial.subjectId || defaults.subjectId || "",
      teacherId: initial.teacherId || defaults.teacherId || "",
      assessmentDate:
        initial.assessmentDate ||
        defaults.assessmentDate ||
        todayDateInputValue(),
    };
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "assessment-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "assessment-form-options", form.academicYearId],
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
    queryKey: ["classes", "assessment-form-options", form.academicYearId],
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

  const classSubjectsQuery = useQuery({
    queryKey: [
      "class-subjects",
      "assessment-form-options",
      form.classId,
      form.academicYearId,
      form.termId,
    ],
    queryFn: async () => {
      const response = await getClassSubjects({
        page: 1,
        limit: 100,
        schoolClassId: form.classId || undefined,
        academicYearId: form.academicYearId || undefined,
        status: "ACTIVE",
      });
      const rows = response?.data ?? [];
      return rows.filter(
        (item) =>
          item.termId == null || String(item.termId) === String(form.termId)
      );
    },
    enabled: Boolean(form.classId && form.academicYearId && form.termId),
  });

  const yearOptions = (yearsQuery.data ?? []).map((year) => ({
    value: String(year.id),
    label: year.name + (year.isCurrent ? " (Current)" : ""),
  }));

  const termOptions = (termsQuery.data ?? []).map((term) => ({
    value: String(term.id),
    label:
      (term.name
        ? `${term.name}${term.code ? ` (${term.code})` : ""}`
        : `Term #${term.id}`) + (term.isCurrent ? " (Current)" : ""),
  }));

  const classOptions = (classesQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatClassLabel(item),
  }));

  const subjectOptions = (classSubjectsQuery.data ?? []).map((item) => ({
    value: String(item.subjectId),
    label: formatSubjectLabel(item.subject || {}),
    teacherId: item.teacherSubject?.teacherId
      ? String(item.teacherSubject.teacherId)
      : "",
    teacherLabel: formatTeacherName(item.teacherSubject?.teacher || {}),
  }));

  const selectedSubject = subjectOptions.find(
    (item) => item.value === form.subjectId
  );

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validateAssessmentForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildAssessmentPayload(form);
      const response = isEdit
        ? await updateAssessment(assessment.id, payload)
        : await createAssessment(payload);

      onSuccess?.(
        response?.data ?? null,
        response?.message,
        isEdit ? "update" : "create"
      );
      onClose?.();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isEdit
            ? "Unable to update assessment."
            : "Unable to create assessment."
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
      className="space-y-[var(--space-6)]"
    >
      {submitError ? (
        <Alert variant="danger" title="Save failed">
          {submitError}
        </Alert>
      ) : null}

      <FormSection
        title="Scope"
        description="Select year, term, class, and an allocated subject with its assigned teacher."
      >
        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) => {
            updateField("academicYearId", event.target.value);
            updateField("termId", "");
            updateField("classId", "");
            updateField("subjectId", "");
            updateField("teacherId", "");
          }}
          options={[
            { value: "", label: "Select academic year" },
            ...yearOptions,
          ]}
          error={errors.academicYearId}
          disabled={yearsQuery.isLoading || saving}
          required
        />
        <SelectField
          label="Term"
          name="termId"
          value={form.termId}
          onChange={(event) => {
            updateField("termId", event.target.value);
            updateField("subjectId", "");
            updateField("teacherId", "");
          }}
          options={[
            { value: "", label: "Select term" },
            ...termOptions,
          ]}
          error={errors.termId}
          disabled={!form.academicYearId || termsQuery.isLoading || saving}
          required
        />
        <SelectField
          label="Class"
          name="classId"
          value={form.classId}
          onChange={(event) => {
            updateField("classId", event.target.value);
            updateField("subjectId", "");
            updateField("teacherId", "");
          }}
          options={[
            { value: "", label: "Select class" },
            ...classOptions,
          ]}
          error={errors.classId}
          disabled={!form.academicYearId || classesQuery.isLoading || saving}
          required
        />
        <SelectField
          label="Subject"
          name="subjectId"
          value={form.subjectId}
          onChange={(event) => {
            const value = event.target.value;
            updateField("subjectId", value);
            const match = subjectOptions.find((item) => item.value === value);
            updateField("teacherId", match?.teacherId || "");
          }}
          options={[
            { value: "", label: "Select allocated subject" },
            ...subjectOptions.map(({ value, label }) => ({ value, label })),
          ]}
          error={errors.subjectId}
          disabled={
            !form.classId ||
            !form.termId ||
            classSubjectsQuery.isLoading ||
            saving
          }
          required
        />
        <TextField
          label="Assigned teacher"
          name="teacherLabel"
          value={selectedSubject?.teacherLabel || "Select a subject first"}
          disabled
        />
        <input type="hidden" name="teacherId" value={form.teacherId} />
        {errors.teacherId ? (
          <p className="text-[length:var(--font-size-sm)] text-[var(--color-danger-600)] sm:col-span-2">
            {errors.teacherId}
          </p>
        ) : null}
      </FormSection>

      <FormSection
        title="Assessment details"
        description="Type, maximum marks, and date must align with the selected year and term."
      >
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Optional display title"
          disabled={saving}
        />
        <SelectField
          label="Assessment type"
          name="assessmentType"
          value={form.assessmentType}
          onChange={(event) =>
            updateField("assessmentType", event.target.value)
          }
          options={ASSESSMENT_TYPE_OPTIONS}
          error={errors.assessmentType}
          disabled={saving}
          required
        />
        <TextField
          label="Maximum marks"
          name="maxMarks"
          type="number"
          min="1"
          step="0.01"
          value={form.maxMarks}
          onChange={(event) => updateField("maxMarks", event.target.value)}
          error={errors.maxMarks}
          disabled={saving}
          required
        />
        <DatePickerField
          label="Assessment date"
          name="assessmentDate"
          value={form.assessmentDate}
          onChange={(event) =>
            updateField("assessmentDate", event.target.value)
          }
          error={errors.assessmentDate}
          disabled={saving}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={ASSESSMENT_STATUS_OPTIONS.map((value) => ({
            value,
            label: value,
          }))}
          error={errors.status}
          disabled={saving}
          required
        />
        <FormGridFull>
          <TextField
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={(event) => updateField("remarks", event.target.value)}
            placeholder="Optional note"
            disabled={saving}
          />
        </FormGridFull>
      </FormSection>

      <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
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
        <SubmitButton loading={saving}>
          {isEdit ? "Save Changes" : "Create Assessment"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default function AssessmentForm({
  open,
  mode = "create",
  assessment = null,
  defaults = {},
  onClose,
  onSuccess,
}) {
  const formId = useId();
  const isEdit = mode === "edit";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Assessment" : "New Assessment"}
      description="Create a class assessment for enrolled students after subject allocation and teacher assignment."
      size="lg"
    >
      {open ? (
        <AssessmentFormBody
          key={`${mode}-${assessment?.id || "new"}`}
          formId={formId}
          isEdit={isEdit}
          assessment={assessment}
          defaults={defaults}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}
