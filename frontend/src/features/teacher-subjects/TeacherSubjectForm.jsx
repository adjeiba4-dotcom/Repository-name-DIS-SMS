import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  SelectField,
  SubmitButton,
  TextField,
} from "../../components/form";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import { getTerms } from "../../services/terms/term.service";
import {
  createTeacherSubject,
  updateTeacherSubject,
} from "../../services/teacher-subjects/teacherSubject.service";
import {
  ASSIGNMENT_STATUS_OPTIONS,
  buildTeacherSubjectPayload,
  getApiErrorMessage,
  mapTeacherSubjectToForm,
  validateTeacherSubjectForm,
} from "./teacherSubject.mappers";

const INITIAL_FORM = {
  teacherId: "",
  subjectId: "",
  academicYearId: "",
  termId: "",
  isPrimary: false,
  weeklyPeriods: "",
  remarks: "",
  status: "Active",
};

function buildInitialForm(isEdit, assignment) {
  const mapped =
    isEdit && assignment ? mapTeacherSubjectToForm(assignment) : null;
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

function TeacherSubjectFormBody({
  formId,
  isEdit,
  assignment,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(isEdit, assignment)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const teachersQuery = useQuery({
    queryKey: ["teachers", "teacher-subject-form-options"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", "teacher-subject-form-options"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "teacher-subject-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: [
      "terms",
      "teacher-subject-form-options",
      form.academicYearId,
    ],
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

  useEffect(() => {
    if (!form.academicYearId || !form.termId) return;
    const terms = termsQuery.data ?? [];
    if (!terms.length) return;
    const stillValid = terms.some(
      (term) => String(term.id) === String(form.termId)
    );
    if (!stillValid) {
      setForm((prev) => ({ ...prev, termId: "" }));
    }
  }, [form.academicYearId, form.termId, termsQuery.data]);

  const teacherOptions = (teachersQuery.data ?? []).map((teacher) => ({
    value: String(teacher.id),
    label: [teacher.firstName, teacher.lastName].filter(Boolean).join(" ")
      ? `${[teacher.firstName, teacher.lastName].filter(Boolean).join(" ")}${
          teacher.staffNo ? ` (${teacher.staffNo})` : ""
        }`
      : `Teacher #${teacher.id}`,
  }));

  const subjectOptions = (subjectsQuery.data ?? []).map((subject) => ({
    value: String(subject.id),
    label: subject.subjectName
      ? `${subject.subjectName}${
          subject.subjectCode ? ` (${subject.subjectCode})` : ""
        }`
      : `Subject #${subject.id}`,
  }));

  const yearOptions = (yearsQuery.data ?? []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }));

  const termOptions = (termsQuery.data ?? []).map((term) => ({
    value: String(term.id),
    label: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : `Term #${term.id}`,
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
    const nextErrors = validateTeacherSubjectForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildTeacherSubjectPayload(form);
      const response = isEdit
        ? await updateTeacherSubject(assignment.id, payload)
        : await createTeacherSubject(payload);

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
            ? "Unable to update assignment."
            : "Unable to create assignment."
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
        title="Assignment"
        description="Teacher + subject + academic year + term must be unique."
      >
        <SelectField
          label="Teacher"
          name="teacherId"
          value={form.teacherId}
          onChange={(event) => updateField("teacherId", event.target.value)}
          options={[
            { value: "", label: "Select teacher" },
            ...teacherOptions,
          ]}
          error={errors.teacherId}
          required
          disabled={teachersQuery.isLoading}
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
          disabled={subjectsQuery.isLoading}
        />
        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) => {
            updateField("academicYearId", event.target.value);
            updateField("termId", "");
          }}
          options={[
            { value: "", label: "Select academic year" },
            ...yearOptions,
          ]}
          error={errors.academicYearId}
          required
          disabled={yearsQuery.isLoading}
        />
        <SelectField
          label="Term"
          name="termId"
          value={form.termId}
          onChange={(event) => updateField("termId", event.target.value)}
          options={[
            { value: "", label: "All terms (optional)" },
            ...termOptions,
          ]}
          error={errors.termId}
          disabled={!form.academicYearId || termsQuery.isLoading}
        />
        <TextField
          label="Weekly periods"
          name="weeklyPeriods"
          type="number"
          min="1"
          value={form.weeklyPeriods}
          onChange={(event) =>
            updateField("weeklyPeriods", event.target.value)
          }
          placeholder="e.g. 4"
          error={errors.weeklyPeriods}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={ASSIGNMENT_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
        />
        <SelectField
          label="Primary teacher"
          name="isPrimary"
          value={form.isPrimary ? "true" : "false"}
          onChange={(event) =>
            updateField("isPrimary", event.target.value === "true")
          }
          options={[
            { value: "false", label: "Secondary" },
            { value: "true", label: "Primary" },
          ]}
        />
        <TextField
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={(event) => updateField("remarks", event.target.value)}
          placeholder="Optional notes"
          error={errors.remarks}
          className="sm:col-span-2"
        />
        <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
          Weekly periods must be greater than zero. Duplicate teacher +
          subject + year + term assignments are blocked. Archive is blocked
          when referenced by timetable, examinations, or results.
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
          {isEdit ? "Save Changes" : "Create Assignment"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit teacher-subject assignment drawer form.
 */
export default function TeacherSubjectForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  assignment = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${assignment?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Assignment" : "Add Assignment"}
      description={
        isEdit
          ? "Update teacher, subject, year, term, or weekly periods."
          : "Assign a teacher to a subject for an academic year."
      }
      size="md"
    >
      {open ? (
        <TeacherSubjectFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          assignment={assignment}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddTeacherSubject(props) {
  return <TeacherSubjectForm mode="create" {...props} />;
}

export function EditTeacherSubject(props) {
  return <TeacherSubjectForm mode="edit" {...props} />;
}
