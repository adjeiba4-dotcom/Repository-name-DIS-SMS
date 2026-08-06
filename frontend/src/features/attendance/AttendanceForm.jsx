import { useEffect, useId, useMemo, useState } from "react";
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
  createAttendance,
  updateAttendance,
} from "../../services/attendance/attendance.service";
import { getClasses } from "../../services/classes/class.service";
import { getEnrollments } from "../../services/enrollments/enrollment.service";
import { getTerms } from "../../services/terms/term.service";
import {
  ATTENDANCE_STATUS_OPTIONS,
  buildAttendancePayload,
  formatClassLabel,
  formatStudentName,
  getApiErrorMessage,
  mapAttendanceToForm,
  todayDateInputValue,
  validateAttendanceForm,
} from "./attendance.mappers";

const INITIAL_FORM = {
  studentId: "",
  academicYearId: "",
  termId: "",
  classId: "",
  attendanceDate: todayDateInputValue(),
  status: "Present",
  remarks: "",
};

function buildInitialForm(isEdit, record) {
  const mapped = isEdit && record ? mapAttendanceToForm(record) : null;
  return mapped ? { ...INITIAL_FORM, ...mapped } : { ...INITIAL_FORM };
}

function AttendanceFormBody({
  formId,
  isEdit,
  record,
  defaults = {},
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() => {
    const initial = buildInitialForm(isEdit, record);
    return {
      ...initial,
      academicYearId: initial.academicYearId || defaults.academicYearId || "",
      termId: initial.termId || defaults.termId || "",
      classId: initial.classId || defaults.classId || "",
      attendanceDate:
        initial.attendanceDate ||
        defaults.attendanceDate ||
        todayDateInputValue(),
    };
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "attendance-form-options"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const termsQuery = useQuery({
    queryKey: ["terms", "attendance-form-options", form.academicYearId],
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
    queryKey: ["classes", "attendance-form-options", form.academicYearId],
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

  const enrollmentsQuery = useQuery({
    queryKey: [
      "enrollments",
      "attendance-form-options",
      form.academicYearId,
      form.termId,
      form.classId,
    ],
    queryFn: async () => {
      const response = await getEnrollments({
        page: 1,
        limit: 100,
        academicYearId: form.academicYearId || undefined,
        schoolClassId: form.classId || undefined,
        status: "ACTIVE",
      });
      const rows = response?.data ?? [];
      return rows.filter(
        (item) =>
          item.termId == null || String(item.termId) === String(form.termId)
      );
    },
    enabled: Boolean(form.academicYearId && form.classId && form.termId),
  });

  useEffect(() => {
    if (!form.academicYearId) {
      setForm((prev) => ({ ...prev, termId: "", classId: "", studentId: "" }));
    }
  }, [form.academicYearId]);

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

  const studentOptions = useMemo(() => {
    return (enrollmentsQuery.data ?? []).map((enrollment) => ({
      value: String(enrollment.studentId),
      label: formatStudentName(enrollment.student || {}),
    }));
  }, [enrollmentsQuery.data]);

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

    const nextErrors = validateAttendanceForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = buildAttendancePayload(form);
      const response = isEdit
        ? await updateAttendance(record.id, payload)
        : await createAttendance(payload);

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
            ? "Unable to update attendance."
            : "Unable to record attendance."
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
        description="Attendance must align with academic year, term, and class enrollment."
      >
        <SelectField
          label="Academic year"
          name="academicYearId"
          value={form.academicYearId}
          onChange={(event) => {
            updateField("academicYearId", event.target.value);
            updateField("termId", "");
            updateField("classId", "");
            updateField("studentId", "");
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
            updateField("studentId", "");
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
            updateField("studentId", "");
          }}
          options={[
            { value: "", label: "Select class" },
            ...classOptions,
          ]}
          error={errors.classId}
          disabled={!form.academicYearId || classesQuery.isLoading || saving}
          required
        />
        <DatePickerField
          label="Attendance date"
          name="attendanceDate"
          value={form.attendanceDate}
          onChange={(event) =>
            updateField("attendanceDate", event.target.value)
          }
          error={errors.attendanceDate}
          disabled={saving}
          required
        />
      </FormSection>

      <FormSection
        title="Student mark"
        description="Only actively enrolled students in the selected class can be marked."
      >
        <SelectField
          label="Student"
          name="studentId"
          value={form.studentId}
          onChange={(event) => updateField("studentId", event.target.value)}
          options={[
            { value: "", label: "Select enrolled student" },
            ...studentOptions,
          ]}
          error={errors.studentId}
          disabled={
            !form.classId ||
            !form.termId ||
            enrollmentsQuery.isLoading ||
            saving ||
            isEdit
          }
          required
        />
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={(event) => updateField("status", event.target.value)}
          options={ATTENDANCE_STATUS_OPTIONS.map((value) => ({
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
          {isEdit ? "Save Changes" : "Record Attendance"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default function AttendanceForm({
  open,
  mode = "create",
  record = null,
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
      title={isEdit ? "Edit Attendance" : "Record Attendance"}
      description="Capture daily student attendance aligned to year, term, class, and timetable."
      size="lg"
    >
      {open ? (
        <AttendanceFormBody
          key={`${mode}-${record?.id || "new"}-${defaults.attendanceDate || ""}`}
          formId={formId}
          isEdit={isEdit}
          record={record}
          defaults={defaults}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </Drawer>
  );
}

export function AddAttendance(props) {
  return <AttendanceForm mode="create" {...props} />;
}

export function EditAttendance(props) {
  return <AttendanceForm mode="edit" {...props} />;
}
