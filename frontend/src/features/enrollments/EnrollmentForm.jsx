import { useEffect, useId, useMemo, useState } from "react";
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
import { getClasses, getClassById } from "../../services/classes/class.service";
import {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
} from "../../services/enrollments/enrollment.service";
import { getStudents, getStudentById } from "../../services/students/student.service";
import { getTerms } from "../../services/terms/term.service";
import {
  ENROLLMENT_STATUS_OPTIONS,
  buildEnrollmentPayload,
  formatClassLabel,
  formatGuardianName,
  formatStudentLabel,
  formatStudentName,
  formatTeacherName,
  getApiErrorMessage,
  mapEnrollmentToForm,
  validateEnrollmentForm,
} from "./enrollment.mappers";

const INITIAL_FORM = {
  studentId: "",
  schoolClassId: "",
  academicYearId: "",
  termId: "",
  enrollmentDate: new Date().toISOString().slice(0, 10),
  remarks: "",
  status: "Active",
};

function buildInitialForm(isEdit, enrollment) {
  const mapped =
    isEdit && enrollment ? mapEnrollmentToForm(enrollment) : null;
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

function InsightPanel({ title, items }) {
  return (
    <div className="sm:col-span-2 rounded-[var(--radius-md)] border border-[var(--color-border-muted)] bg-[var(--color-surface-muted)] p-[var(--space-4)]">
      <Caption
        variant="muted"
        size="sm"
        className="m-0 mb-[var(--space-3)] font-[number:var(--font-weight-semibold)] uppercase tracking-wide"
      >
        {title}
      </Caption>
      <dl className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt>
              <Caption variant="muted" size="sm" className="m-0">
                {item.label}
              </Caption>
            </dt>
            <dd>
              <Body
                variant="default"
                size="sm"
                className="m-0 truncate font-[number:var(--font-weight-semibold)]"
              >
                {item.value || "—"}
              </Body>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EnrollmentFormBody({
  formId,
  isEdit,
  enrollment,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(isEdit, enrollment)
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const studentsQuery = useQuery({
    queryKey: ["students", "enrollment-form-options"],
    queryFn: async () => {
      const response = await getStudents();
      return response?.data ?? [];
    },
  });

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "enrollment-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const classesQuery = useQuery({
    queryKey: [
      "classes",
      "enrollment-form-options",
      form.academicYearId,
    ],
    queryFn: async () => {
      const response = await getClasses({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
      });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "enrollment-form-options", form.academicYearId],
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

  const selectedStudentQuery = useQuery({
    queryKey: ["students", "enrollment-form-detail", form.studentId],
    queryFn: async () => {
      const response = await getStudentById(form.studentId);
      return response?.data ?? null;
    },
    enabled: Boolean(form.studentId),
  });

  const currentEnrollmentQuery = useQuery({
    queryKey: [
      "enrollments",
      "current-for-student",
      form.studentId,
    ],
    queryFn: async () => {
      const response = await getEnrollments({
        page: 1,
        limit: 1,
        studentId: form.studentId,
        status: "ACTIVE",
        sortBy: "enrollmentDate",
        sortOrder: "desc",
      });
      return response?.data?.[0] ?? null;
    },
    enabled: Boolean(form.studentId),
  });

  const selectedClassQuery = useQuery({
    queryKey: ["classes", "enrollment-form-detail", form.schoolClassId],
    queryFn: async () => {
      const response = await getClassById(form.schoolClassId);
      return response?.data ?? null;
    },
    enabled: Boolean(form.schoolClassId),
  });

  const classEnrollmentCountQuery = useQuery({
    queryKey: [
      "enrollments",
      "count-for-class",
      form.schoolClassId,
    ],
    queryFn: async () => {
      const response = await getEnrollments({
        page: 1,
        limit: 1,
        schoolClassId: form.schoolClassId,
      });
      return response?.pagination?.total ?? 0;
    },
    enabled: Boolean(form.schoolClassId),
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

  useEffect(() => {
    if (!form.academicYearId || !form.schoolClassId) return;
    const classes = classesQuery.data ?? [];
    if (!classes.length) return;
    const stillValid = classes.some(
      (item) => String(item.id) === String(form.schoolClassId)
    );
    if (!stillValid) {
      setForm((prev) => ({ ...prev, schoolClassId: "" }));
    }
  }, [form.academicYearId, form.schoolClassId, classesQuery.data]);

  const studentOptions = (studentsQuery.data ?? []).map((student) => ({
    value: String(student.id),
    label: formatStudentLabel(student),
  }));

  const yearOptions = (yearsQuery.data ?? []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }));

  const classOptions = (classesQuery.data ?? [])
    .filter(
      (item) =>
        !form.academicYearId ||
        String(item.academicYearId) === String(form.academicYearId)
    )
    .map((item) => ({
      value: String(item.id),
      label: formatClassLabel(item),
    }));

  const termOptions = (termsQuery.data ?? []).map((term) => ({
    value: String(term.id),
    label: term.name
      ? `${term.name}${term.code ? ` (${term.code})` : ""}`
      : `Term #${term.id}`,
  }));

  const selectedStudent =
    selectedStudentQuery.data ||
    (studentsQuery.data ?? []).find(
      (item) => String(item.id) === String(form.studentId)
    ) ||
    null;

  const selectedClass =
    selectedClassQuery.data ||
    (classesQuery.data ?? []).find(
      (item) => String(item.id) === String(form.schoolClassId)
    ) ||
    null;

  const currentEnrollment = currentEnrollmentQuery.data;
  const currentEnrollmentLabel = currentEnrollment
    ? `${formatClassLabel(currentEnrollment.schoolClass)} — ${
        currentEnrollment.academicYear?.name || "Year"
      }`
    : "None";

  const capacity = selectedClass?.capacity ?? null;
  const enrolledCount = classEnrollmentCountQuery.data ?? 0;
  const availableSeats =
    capacity != null ? Math.max(capacity - enrolledCount, 0) : null;

  const studentInsights = useMemo(() => {
    if (!form.studentId || !selectedStudent) return null;
    return [
      {
        label: "Student Number",
        value: selectedStudent.admissionNo || "—",
      },
      {
        label: "Name",
        value: formatStudentName(selectedStudent),
      },
      {
        label: "Guardian",
        value: formatGuardianName(selectedStudent),
      },
      {
        label: "Current Enrollment",
        value: currentEnrollmentLabel,
      },
    ];
  }, [
    form.studentId,
    selectedStudent,
    currentEnrollmentLabel,
  ]);

  const classInsights = useMemo(() => {
    if (!form.schoolClassId || !selectedClass) return null;
    return [
      {
        label: "Capacity",
        value: capacity != null ? String(capacity) : "—",
      },
      {
        label: "Current Enrollment",
        value: String(enrolledCount),
      },
      {
        label: "Available Seats",
        value: availableSeats != null ? String(availableSeats) : "—",
      },
      {
        label: "Class Teacher",
        value: formatTeacherName(selectedClass.classTeacher),
      },
    ];
  }, [
    form.schoolClassId,
    selectedClass,
    capacity,
    enrolledCount,
    availableSeats,
  ]);

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

  const handleClassChange = (value) => {
    const schoolClass = (classesQuery.data ?? []).find(
      (item) => String(item.id) === String(value)
    );
    setForm((prev) => ({
      ...prev,
      schoolClassId: value,
      academicYearId: schoolClass?.academicYearId
        ? String(schoolClass.academicYearId)
        : prev.academicYearId,
      termId: schoolClass?.academicYearId
        ? prev.academicYearId === String(schoolClass.academicYearId)
          ? prev.termId
          : ""
        : prev.termId,
    }));
    if (errors.schoolClassId || errors.academicYearId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.schoolClassId;
        delete next.academicYearId;
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateEnrollmentForm(form);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildEnrollmentPayload(form);
      const response = isEdit
        ? await updateEnrollment(enrollment.id, payload)
        : await createEnrollment(payload);

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
            ? "Unable to update enrollment."
            : "Unable to create enrollment."
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
        title="Placement"
        description="One active enrollment per student per academic year. Class capacity must not be exceeded."
      >
        <SelectField
          label="Student"
          name="studentId"
          value={form.studentId}
          onChange={(event) => updateField("studentId", event.target.value)}
          options={[
            { value: "", label: "Select student" },
            ...studentOptions,
          ]}
          error={errors.studentId}
          required
          disabled={studentsQuery.isLoading}
          className="sm:col-span-2"
        />
        {studentInsights ? (
          <InsightPanel title="Student snapshot" items={studentInsights} />
        ) : null}

        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) => {
            updateField("academicYearId", event.target.value);
            updateField("termId", "");
            updateField("schoolClassId", "");
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
            { value: "", label: "Optional term" },
            ...termOptions,
          ]}
          error={errors.termId}
          disabled={!form.academicYearId || termsQuery.isLoading}
        />
        <SelectField
          label="Class"
          name="schoolClassId"
          value={form.schoolClassId}
          onChange={(event) => handleClassChange(event.target.value)}
          options={[
            { value: "", label: "Select class" },
            ...classOptions,
          ]}
          error={errors.schoolClassId}
          required
          disabled={!form.academicYearId || classesQuery.isLoading}
          className="sm:col-span-2"
        />
        {classInsights ? (
          <InsightPanel title="Class snapshot" items={classInsights} />
        ) : null}

        <DatePickerField
          label="Enrollment date"
          name="enrollmentDate"
          value={form.enrollmentDate}
          onChange={(event) =>
            updateField("enrollmentDate", event.target.value)
          }
          error={errors.enrollmentDate}
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={ENROLLMENT_STATUS_OPTIONS.map((item) => ({
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
          Academic year must match the selected class. Duplicate active
          enrollments for the same student and year are blocked.
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
          {isEdit ? "Save Changes" : "Enroll Student"}
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Add / Edit enrollment drawer form.
 */
export default function EnrollmentForm({
  open,
  onClose,
  onSuccess,
  mode = "create",
  enrollment = null,
}) {
  const isEdit = mode === "edit";
  const formId = useId();
  const instanceKey = `${mode}:${enrollment?.id ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Enrollment" : "Enroll Student"}
      description={
        isEdit
          ? "Update student placement, class, year, term, or status."
          : "Place a student into a class for an academic year."
      }
      size="md"
    >
      {open ? (
        <EnrollmentFormBody
          key={instanceKey}
          formId={formId}
          isEdit={isEdit}
          enrollment={enrollment}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddEnrollment(props) {
  return <EnrollmentForm mode="create" {...props} />;
}

export function EditEnrollment(props) {
  return <EnrollmentForm mode="edit" {...props} />;
}
