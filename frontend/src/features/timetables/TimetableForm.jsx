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
import { getClassSubjects } from "../../services/class-subjects/classSubject.service";
import { getTerms } from "../../services/terms/term.service";
import {
  createTimetable,
  updateTimetable,
} from "../../services/timetables/timetable.service";
import {
  DAYS_OF_WEEK,
  DAY_LABELS,
  TIMETABLE_STATUS_OPTIONS,
  buildTimetablePayload,
  formatClassLabel,
  formatSubjectLabel,
  formatTeacherName,
  getApiErrorMessage,
  mapTimetableToForm,
  validateTimetableForm,
} from "./timetable.mappers";

const INITIAL_FORM = {
  academicYearId: "",
  termId: "",
  classId: "",
  classSubjectId: "",
  subjectId: "",
  teacherId: "",
  dayOfWeek: "MONDAY",
  startTime: "",
  endTime: "",
  room: "",
  remarks: "",
  status: "Active",
};

function buildInitialForm(isEdit, entry) {
  const mapped = isEdit && entry ? mapTimetableToForm(entry) : null;
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

function TimetableFormBody({
  formId,
  isEdit,
  entry,
  defaults = {},
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() => {
    const initial = buildInitialForm(isEdit, entry);
    return {
      ...initial,
      academicYearId: initial.academicYearId || defaults.academicYearId || "",
      termId: initial.termId || defaults.termId || "",
      classId: initial.classId || defaults.classId || "",
    };
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "timetable-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "timetable-form-options", form.academicYearId],
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
    queryKey: ["classes", "timetable-form-options", form.academicYearId],
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
      "timetable-form-options",
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
      // Include term-specific and year-wide (null term) allocations.
      return rows.filter(
        (item) =>
          item.termId == null ||
          String(item.termId) === String(form.termId)
      );
    },
    enabled: Boolean(form.classId && form.academicYearId && form.termId),
  });

  const selectedClassSubject = useMemo(() => {
    const list = classSubjectsQuery.data ?? [];
    return (
      list.find((item) => String(item.id) === String(form.classSubjectId)) ||
      list.find(
        (item) =>
          String(item.subjectId) === String(form.subjectId) &&
          String(item.teacherSubject?.teacherId || "") ===
            String(form.teacherId)
      ) ||
      null
    );
  }, [
    classSubjectsQuery.data,
    form.classSubjectId,
    form.subjectId,
    form.teacherId,
  ]);

  useEffect(() => {
    if (!isEdit || form.classSubjectId || !classSubjectsQuery.data?.length) {
      return;
    }
    const match = classSubjectsQuery.data.find(
      (item) =>
        String(item.subjectId) === String(form.subjectId) &&
        String(item.teacherSubject?.teacherId || "") === String(form.teacherId)
    );
    if (match) {
      setForm((prev) => ({ ...prev, classSubjectId: String(match.id) }));
    }
  }, [
    isEdit,
    form.classSubjectId,
    form.subjectId,
    form.teacherId,
    classSubjectsQuery.data,
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

  const classOptions = (classesQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatClassLabel(item),
  }));

  const classSubjectOptions = (classSubjectsQuery.data ?? []).map((item) => {
    const subject = item.subject || {};
    const teacher = item.teacherSubject?.teacher || {};
    return {
      value: String(item.id),
      label: `${formatSubjectLabel(subject)} — ${formatTeacherName(teacher)}`,
    };
  });

  const dayOptions = DAYS_OF_WEEK.map((day) => ({
    value: day,
    label: DAY_LABELS[day],
  }));

  const derivedSubject = selectedClassSubject?.subject
    ? formatSubjectLabel(selectedClassSubject.subject)
    : form.subjectId && entry?.subject
      ? formatSubjectLabel(entry.subject)
      : "";
  const derivedTeacher = selectedClassSubject?.teacherSubject?.teacher
    ? formatTeacherName(selectedClassSubject.teacherSubject.teacher)
    : form.teacherId && entry?.teacher
      ? formatTeacherName(entry.teacher)
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

  const handleClassSubjectChange = (value) => {
    const allocation = (classSubjectsQuery.data ?? []).find(
      (item) => String(item.id) === String(value)
    );
    setForm((prev) => ({
      ...prev,
      classSubjectId: value,
      subjectId: allocation?.subjectId ? String(allocation.subjectId) : "",
      teacherId: allocation?.teacherSubject?.teacherId
        ? String(allocation.teacherSubject.teacherId)
        : "",
    }));
    if (errors.subjectId || errors.teacherId || errors.classSubjectId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.subjectId;
        delete next.teacherId;
        delete next.classSubjectId;
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateTimetableForm(form);
    if (!form.classSubjectId && !isEdit) {
      nextErrors.classSubjectId =
        "Class subject allocation is required.";
    }
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildTimetablePayload(form);
      const response = isEdit
        ? await updateTimetable(entry.id, payload)
        : await createTimetable(payload);

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
            ? "Unable to update timetable slot."
            : "Unable to create timetable slot."
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
        title="Academic scope"
        description="Slots are scoped to academic year and term. Class must belong to the selected year."
      >
        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) => {
            updateField("academicYearId", event.target.value);
            updateField("termId", "");
            updateField("classId", "");
            updateField("classSubjectId", "");
            updateField("subjectId", "");
            updateField("teacherId", "");
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
          onChange={(event) => {
            updateField("termId", event.target.value);
            updateField("classSubjectId", "");
            updateField("subjectId", "");
            updateField("teacherId", "");
          }}
          options={[
            { value: "", label: "Select term" },
            ...termOptions,
          ]}
          error={errors.termId}
          required
          disabled={!form.academicYearId || termsQuery.isLoading}
        />
        <SelectField
          label="Class"
          name="classId"
          value={form.classId}
          onChange={(event) => {
            updateField("classId", event.target.value);
            updateField("classSubjectId", "");
            updateField("subjectId", "");
            updateField("teacherId", "");
          }}
          options={[
            { value: "", label: "Select class" },
            ...classOptions,
          ]}
          error={errors.classId}
          required
          disabled={!form.academicYearId || classesQuery.isLoading}
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection
        title="Allocation"
        description="Subject and teacher are derived from an active class subject allocation (teacher subject assignment)."
      >
        <SelectField
          label="Class subject allocation"
          name="classSubjectId"
          value={form.classSubjectId}
          onChange={(event) => handleClassSubjectChange(event.target.value)}
          options={[
            { value: "", label: "Select allocation" },
            ...classSubjectOptions,
          ]}
          error={errors.classSubjectId || errors.subjectId || errors.teacherId}
          required
          disabled={
            !form.classId ||
            !form.termId ||
            classSubjectsQuery.isLoading
          }
          className="sm:col-span-2"
        />
        <TextField
          label="Subject"
          name="derivedSubject"
          value={derivedSubject}
          readOnly
          placeholder="Select an allocation"
          disabled
        />
        <TextField
          label="Teacher"
          name="derivedTeacher"
          value={derivedTeacher}
          readOnly
          placeholder="Select an allocation"
          disabled
        />
      </FormSection>

      <FormSection
        title="Period"
        description="Clash detection blocks overlapping class, teacher, and room bookings."
      >
        <SelectField
          label="Day of week"
          name="dayOfWeek"
          value={form.dayOfWeek}
          onChange={(event) => updateField("dayOfWeek", event.target.value)}
          options={dayOptions}
          error={errors.dayOfWeek}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={TIMETABLE_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.status}
          required
        />
        <TextField
          label="Start time"
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={(event) => updateField("startTime", event.target.value)}
          error={errors.startTime}
          required
        />
        <TextField
          label="End time"
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={(event) => updateField("endTime", event.target.value)}
          error={errors.endTime}
          required
        />
        <TextField
          label="Room"
          name="room"
          value={form.room}
          onChange={(event) => updateField("room", event.target.value)}
          placeholder="Optional room / venue"
          error={errors.room}
        />
        <TextField
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={(event) => updateField("remarks", event.target.value)}
          placeholder="Optional notes"
          error={errors.remarks}
        />
        <Caption variant="muted" size="sm" className="m-0 sm:col-span-2">
          Requires an active class subject allocation and matching teacher
          subject assignment. Weekly period capacity from the allocation is
          enforced.
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
          {isEdit ? "Save Changes" : "Create Slot"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit timetable slot drawer form.
 */
export default function TimetableForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  entry = null,
  defaults = {},
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${entry?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Timetable Slot" : "Add Timetable Slot"}
      description={
        isEdit
          ? "Update class allocation, day, time, or room. Clash rules still apply."
          : "Schedule a period from an active class subject allocation."
      }
      size="md"
    >
      {open ? (
        <TimetableFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          entry={entry}
          defaults={defaults}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddTimetable(props) {
  return <TimetableForm mode="create" {...props} />;
}

export function EditTimetable(props) {
  return <TimetableForm mode="edit" {...props} />;
}
