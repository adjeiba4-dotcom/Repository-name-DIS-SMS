import { useEffect, useId, useMemo, useState } from "react";
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
import { getClasses } from "../../services/classes/class.service";
import { getTeacherSubjects } from "../../services/teacher-subjects/teacherSubject.service";
import { getTerms } from "../../services/terms/term.service";
import {
  createClassSubject,
  updateClassSubject,
} from "../../services/class-subjects/classSubject.service";
import {
  ALLOCATION_STATUS_OPTIONS,
  buildClassSubjectPayload,
  formatTeacherName,
  formatTeacherSubjectLabel,
  getApiErrorMessage,
  mapClassSubjectToForm,
  validateClassSubjectForm,
} from "./classSubject.mappers";

const INITIAL_FORM = {
  schoolClassId: "",
  teacherSubjectId: "",
  academicYearId: "",
  termId: "",
  weeklyPeriods: "",
  isCompulsory: true,
  displayOrder: "0",
  remarks: "",
  status: "Active",
};

function buildInitialForm(isEdit, allocation) {
  const mapped =
    isEdit && allocation ? mapClassSubjectToForm(allocation) : null;
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

function ClassSubjectFormBody({
  formId,
  isEdit,
  allocation,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(isEdit, allocation)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const classesQuery = useQuery({
    queryKey: ["classes", "class-subject-form-options"],
    queryFn: async () => {
      const response = await getClasses({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const teacherSubjectsQuery = useQuery({
    queryKey: ["teacher-subjects", "class-subject-form-options"],
    queryFn: async () => {
      const response = await getTeacherSubjects({
        page: 1,
        limit: 100,
        status: "ACTIVE",
      });
      return response?.data ?? [];
    },
  });

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "class-subject-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: [
      "terms",
      "class-subject-form-options",
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

  const selectedTeacherSubject = useMemo(() => {
    const list = teacherSubjectsQuery.data ?? [];
    return (
      list.find(
        (item) => String(item.id) === String(form.teacherSubjectId)
      ) ||
      (isEdit && allocation?.teacherSubject
        ? allocation.teacherSubject
        : null)
    );
  }, [
    teacherSubjectsQuery.data,
    form.teacherSubjectId,
    isEdit,
    allocation,
  ]);

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

  const classOptions = (classesQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.className
      ? `${item.className}${item.classCode ? ` (${item.classCode})` : ""}`
      : `Class #${item.id}`,
  }));

  const teacherSubjectOptions = (teacherSubjectsQuery.data ?? []).map(
    (item) => ({
      value: String(item.id),
      label: formatTeacherSubjectLabel(item),
    })
  );

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

  const derivedTeacher = selectedTeacherSubject?.teacher
    ? formatTeacherName(selectedTeacherSubject.teacher)
    : "";
  const derivedSubject = selectedTeacherSubject?.subject?.subjectName
    ? `${selectedTeacherSubject.subject.subjectName}${
        selectedTeacherSubject.subject.subjectCode
          ? ` (${selectedTeacherSubject.subject.subjectCode})`
          : ""
      }`
    : "";

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

  const handleTeacherSubjectChange = (value) => {
    const assignment = (teacherSubjectsQuery.data ?? []).find(
      (item) => String(item.id) === String(value)
    );
    setForm((prev) => ({
      ...prev,
      teacherSubjectId: value,
      academicYearId: assignment?.academicYearId
        ? String(assignment.academicYearId)
        : prev.academicYearId,
      termId: "",
      weeklyPeriods:
        assignment?.weeklyPeriods != null && !prev.weeklyPeriods
          ? String(assignment.weeklyPeriods)
          : prev.weeklyPeriods,
    }));
    if (errors.teacherSubjectId || errors.academicYearId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.teacherSubjectId;
        delete next.academicYearId;
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateClassSubjectForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildClassSubjectPayload(form);
      const response = isEdit
        ? await updateClassSubject(allocation.id, payload)
        : await createClassSubject(payload);

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
            ? "Unable to update allocation."
            : "Unable to create allocation."
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
        title="Allocation"
        description="Class + subject + academic year + term must be unique. Subject and teacher come from the teacher subject assignment."
      >
        <SelectField
          label="Class"
          name="schoolClassId"
          value={form.schoolClassId}
          onChange={(event) =>
            updateField("schoolClassId", event.target.value)
          }
          options={[
            { value: "", label: "Select class" },
            ...classOptions,
          ]}
          error={errors.schoolClassId}
          required
          disabled={classesQuery.isLoading}
        />
        <SelectField
          label="Teacher subject assignment"
          name="teacherSubjectId"
          value={form.teacherSubjectId}
          onChange={(event) =>
            handleTeacherSubjectChange(event.target.value)
          }
          options={[
            { value: "", label: "Select assignment" },
            ...teacherSubjectOptions,
          ]}
          error={errors.teacherSubjectId}
          required
          disabled={teacherSubjectsQuery.isLoading}
          className="sm:col-span-2"
        />
        <TextField
          label="Teacher"
          name="derivedTeacher"
          value={derivedTeacher}
          readOnly
          placeholder="Select an assignment"
          disabled
        />
        <TextField
          label="Subject"
          name="derivedSubject"
          value={derivedSubject}
          readOnly
          placeholder="Select an assignment"
          disabled
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
        <TextField
          label="Display order"
          name="displayOrder"
          type="number"
          min="0"
          value={form.displayOrder}
          onChange={(event) =>
            updateField("displayOrder", event.target.value)
          }
          placeholder="0"
          error={errors.displayOrder}
        />
        <SelectField
          label="Compulsory"
          name="isCompulsory"
          value={form.isCompulsory ? "true" : "false"}
          onChange={(event) =>
            updateField("isCompulsory", event.target.value === "true")
          }
          options={[
            { value: "true", label: "Compulsory" },
            { value: "false", label: "Optional" },
          ]}
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={ALLOCATION_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
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
          Weekly periods must be greater than zero. Academic year must match
          the teacher subject assignment. Archive is blocked when referenced
          by timetable, examinations, or results.
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
          {isEdit ? "Save Changes" : "Create Allocation"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit class-subject allocation drawer form.
 */
export default function ClassSubjectForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  allocation = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${allocation?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Allocation" : "Add Allocation"}
      description={
        isEdit
          ? "Update class, teacher subject assignment, year, term, or periods."
          : "Allocate a subject to a class via a teacher subject assignment."
      }
      size="md"
    >
      {open ? (
        <ClassSubjectFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          allocation={allocation}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddClassSubject(props) {
  return <ClassSubjectForm mode="create" {...props} />;
}

export function EditClassSubject(props) {
  return <ClassSubjectForm mode="edit" {...props} />;
}
