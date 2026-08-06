import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  LayoutList,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { DatePickerField, SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  bulkAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  getAttendanceRoster,
  getAttendanceStats,
} from "../../services/attendance/attendance.service";
import { getClasses } from "../../services/classes/class.service";
import { getStudents } from "../../services/students/student.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import { getTerms } from "../../services/terms/term.service";
import AttendanceDeleteDialog from "./AttendanceDeleteDialog";
import AttendanceForm from "./AttendanceForm";
import AttendanceList from "./AttendanceList";
import AttendanceProfile from "./AttendanceProfile";
import AttendanceRoster from "./AttendanceRoster";
import AttendanceStats from "./AttendanceStats";
import AttendanceSummaries from "./AttendanceSummaries";
import {
  exportAttendanceToExcel,
  exportAttendanceToPdf,
  exportRosterToExcel,
  exportRosterToPdf,
  printAttendance,
  printRoster,
} from "./attendance.export";
import {
  formatClassLabel,
  formatStudentName,
  formatTeacherName,
  getApiErrorMessage,
  mapAttendanceToRow,
  mapRosterStudentToRow,
  todayDateInputValue,
} from "./attendance.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "roster", label: "Take Sheet", icon: ClipboardCheck },
  { id: "directory", label: "Directory", icon: LayoutList },
  { id: "summaries", label: "Summaries", icon: BarChart3 },
];

function compareValues(a, b) {
  const left = (a ?? "").toString().toLowerCase();
  const right = (b ?? "").toString().toLowerCase();
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortRows(rows, sortKey, sortDirection) {
  const next = [...rows];
  next.sort((a, b) => {
    const result = compareValues(a[sortKey], b[sortKey]);
    return sortDirection === "asc" ? result : -result;
  });
  return next;
}

/**
 * Attendance workspace — take sheet, directory, and summaries.
 */
export default function AttendancePage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("roster");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayDateInputValue());
  const [summaryScope, setSummaryScope] = useState("daily");
  const [summaryTeacherId, setSummaryTeacherId] = useState("");
  const [summaryStudentId, setSummaryStudentId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("attendanceDateLabel");
  const [sortDirection, setSortDirection] = useState("desc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileRecordId, setProfileRecordId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingRecord, setEditingRecord] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [savingStudentId, setSavingStudentId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const [filterKey, setFilterKey] = useState(
    () =>
      `${viewMode}|${academicYearId}|${termId}|${classId}|${attendanceDate}|${debouncedSearch}|${status}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${attendanceDate}|${debouncedSearch}|${status}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "attendance-workspace"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  useEffect(() => {
    if (academicYearId || !yearsQuery.data?.length) return;
    const current =
      yearsQuery.data.find((year) => year.isCurrent) || yearsQuery.data[0];
    if (current) setAcademicYearId(String(current.id));
  }, [yearsQuery.data, academicYearId]);

  const termsQuery = useQuery({
    queryKey: ["terms", "attendance-workspace", academicYearId],
    queryFn: async () => {
      const response = await getTerms({
        page: 1,
        limit: 100,
        academicYearId: academicYearId || undefined,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(academicYearId),
  });

  useEffect(() => {
    if (!academicYearId) {
      setTermId("");
      return;
    }
    const terms = termsQuery.data ?? [];
    if (!terms.length) {
      setTermId("");
      return;
    }
    if (termId && terms.some((term) => String(term.id) === termId)) return;
    const current = terms.find((term) => term.isCurrent) || terms[0];
    setTermId(String(current.id));
  }, [academicYearId, termsQuery.data, termId]);

  const classesQuery = useQuery({
    queryKey: ["classes", "attendance-workspace", academicYearId],
    queryFn: async () => {
      const response = await getClasses({
        page: 1,
        limit: 100,
        academicYearId: academicYearId || undefined,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(academicYearId),
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "attendance-workspace"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "attendance-workspace"],
    queryFn: async () => {
      const response = await getStudents();
      return response?.data ?? [];
    },
  });

  const rosterReady =
    viewMode === "roster" &&
    Boolean(academicYearId && termId && classId && attendanceDate);

  const rosterQuery = useQuery({
    queryKey: [
      "attendance",
      "roster",
      academicYearId,
      termId,
      classId,
      attendanceDate,
    ],
    queryFn: async () => {
      const response = await getAttendanceRoster({
        academicYearId,
        termId,
        classId,
        attendanceDate,
      });
      return response?.data ?? null;
    },
    enabled: rosterReady,
    placeholderData: keepPreviousData,
  });

  const directoryReady =
    viewMode === "directory" && Boolean(academicYearId && termId);

  const directoryQuery = useQuery({
    queryKey: [
      "attendance",
      "directory",
      academicYearId,
      termId,
      classId,
      attendanceDate,
      page,
      pageSize,
      debouncedSearch,
      status,
      sortKey,
      sortDirection,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        academicYearId,
        termId,
        search: debouncedSearch || undefined,
        sortBy:
          sortKey === "attendanceDateLabel" ? "attendanceDate" : "attendanceDate",
        sortOrder: sortDirection,
      };
      if (classId) params.classId = classId;
      if (attendanceDate) params.attendanceDate = attendanceDate;
      if (status !== "all") {
        const statusMap = {
          Present: "PRESENT",
          Absent: "ABSENT",
          Late: "LATE",
          Excused: "EXCUSED",
        };
        params.status = statusMap[status] || status.toUpperCase();
      }
      const response = await getAttendance(params);
      return response;
    },
    enabled: directoryReady,
    placeholderData: keepPreviousData,
  });

  const summariesReady =
    viewMode === "summaries" &&
    Boolean(academicYearId && termId) &&
    (summaryScope !== "teacher" || Boolean(summaryTeacherId)) &&
    (summaryScope !== "student" || Boolean(summaryStudentId)) &&
    (summaryScope !== "class" || Boolean(classId));

  const statsQuery = useQuery({
    queryKey: [
      "attendance",
      "stats",
      summaryScope,
      academicYearId,
      termId,
      classId,
      attendanceDate,
      summaryTeacherId,
      summaryStudentId,
    ],
    queryFn: async () => {
      const params = {
        scope: summaryScope,
        academicYearId,
        termId,
        attendanceDate: attendanceDate || undefined,
      };
      if (classId) params.classId = classId;
      if (summaryScope === "teacher") params.teacherId = summaryTeacherId;
      if (summaryScope === "student") params.studentId = summaryStudentId;
      const response = await getAttendanceStats(params);
      return response?.data ?? null;
    },
    enabled: summariesReady,
    placeholderData: keepPreviousData,
  });

  const refreshAttendance = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
  };

  const classLabel = useMemo(() => {
    const found = (classesQuery.data ?? []).find(
      (item) => String(item.id) === classId
    );
    return found ? formatClassLabel(found) : "";
  }, [classesQuery.data, classId]);

  const rosterRows = useMemo(() => {
    const students = rosterQuery.data?.students ?? [];
    return students.map((student) =>
      mapRosterStudentToRow(student, {
        academicYearId,
        termId,
        classId,
        classLabel,
        attendanceDate,
      })
    );
  }, [rosterQuery.data, academicYearId, termId, classId, classLabel, attendanceDate]);

  const directoryRows = useMemo(() => {
    const records = directoryQuery.data?.data ?? [];
    return sortRows(
      records.map(mapAttendanceToRow),
      sortKey,
      sortDirection
    );
  }, [directoryQuery.data, sortKey, sortDirection]);

  const rosterLoading = rosterQuery.isLoading && !rosterQuery.data;
  const directoryLoading = directoryQuery.isLoading && !directoryQuery.data;
  const statsLoading = statsQuery.isLoading && !statsQuery.data;

  const rosterError = rosterQuery.isError
    ? getApiErrorMessage(
        rosterQuery.error,
        "Unable to load attendance roster."
      )
    : "";
  const directoryError = directoryQuery.isError
    ? getApiErrorMessage(
        directoryQuery.error,
        "Unable to load attendance directory."
      )
    : "";

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

  const teacherOptions = (teachersQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatTeacherName(item),
  }));

  const studentOptions = (studentsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatStudentName(item),
  }));

  const openCreateForm = () => {
    setFormMode("create");
    setEditingRecord(null);
    setFormOpen(true);
  };

  const openEditForm = async (recordLike) => {
    const id = recordLike?.attendanceId || recordLike?.id;
    if (!id || String(id).startsWith("draft-")) return;

    setProfileOpen(false);
    try {
      const response = await getAttendanceById(id);
      setEditingRecord(response?.data ?? recordLike);
    } catch {
      setEditingRecord(recordLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    const id = row.attendanceId || row.id;
    if (!id || String(id).startsWith("draft-")) return;
    setProfileRecordId(id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_record, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Attendance updated successfully."
          : "Attendance recorded successfully.")
    );
    refreshAttendance();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || String(deleteTarget.id).startsWith("draft-")) {
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteAttendance(deleteTarget.id);
      toastSuccess(
        response?.message || "Attendance deleted successfully."
      );
      setDeleteTarget(null);
      refreshAttendance();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to delete attendance. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRosterStatusChange = async (row, statusApi) => {
    if (!academicYearId || !termId || !classId || !attendanceDate) return;

    setSavingStudentId(row.studentId);
    try {
      if (!statusApi) {
        if (row.attendanceId) {
          await deleteAttendance(row.attendanceId);
          toastSuccess("Attendance cleared for student.");
        }
      } else {
        await bulkAttendance({
          academicYearId: Number(academicYearId),
          termId: Number(termId),
          classId: Number(classId),
          attendanceDate,
          action: "UPSERT",
          entries: [
            {
              studentId: Number(row.studentId),
              status: statusApi,
              remarks: row.remarks || null,
            },
          ],
        });
        toastSuccess("Attendance updated.");
      }
      refreshAttendance();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to update student attendance.")
      );
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (!academicYearId || !termId || !classId || !attendanceDate) return;

    setBulkLoading(true);
    try {
      const response = await bulkAttendance({
        academicYearId: Number(academicYearId),
        termId: Number(termId),
        classId: Number(classId),
        attendanceDate,
        action,
      });
      toastSuccess(
        response?.message ||
          (action === "CLEAR"
            ? "Attendance cleared for class."
            : "Bulk attendance applied.")
      );
      refreshAttendance();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to process bulk attendance.")
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (viewMode === "roster") {
      if (!rosterRows.length) {
        toastError("No roster rows to export.");
        return;
      }
      exportRosterToExcel(rosterRows, `attendance-roster-${attendanceDate}.xlsx`);
      toastSuccess("Excel export ready.");
      return;
    }

    if (!directoryRows.length) {
      toastError("No attendance records to export.");
      return;
    }
    exportAttendanceToExcel(directoryRows, "attendance.xlsx");
    toastSuccess("Excel export ready.");
  };

  const handleExportPdf = () => {
    if (viewMode === "roster") {
      if (!rosterRows.length) {
        toastError("No roster rows to export.");
        return;
      }
      exportRosterToPdf(rosterRows, `attendance-roster-${attendanceDate}.pdf`);
      toastSuccess("PDF export ready.");
      return;
    }

    if (!directoryRows.length) {
      toastError("No attendance records to export.");
      return;
    }
    exportAttendanceToPdf(directoryRows, "attendance.pdf");
    toastSuccess("PDF export ready.");
  };

  const handlePrint = () => {
    if (viewMode === "roster") {
      if (!rosterRows.length) {
        toastError("No roster rows to print.");
        return;
      }
      printRoster(rosterRows);
      return;
    }

    if (!directoryRows.length) {
      toastError("No attendance records to print.");
      return;
    }
    printAttendance(directoryRows);
  };

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to continue."
      : viewMode === "roster" && !classId
        ? "Select a class to open the take sheet."
        : viewMode === "roster" && !attendanceDate
          ? "Select an attendance date."
          : viewMode === "summaries" && summaryScope === "class" && !classId
            ? "Select a class for class summaries."
            : viewMode === "summaries" &&
                summaryScope === "teacher" &&
                !summaryTeacherId
              ? "Select a teacher for teacher summaries."
              : viewMode === "summaries" &&
                  summaryScope === "student" &&
                  !summaryStudentId
                ? "Select a student for student summaries."
                : "";

  const metricsSummary = rosterQuery.data?.summary;
  const metricsSlots = rosterQuery.data?.timetableSlots ?? [];
  const metricsOverview =
    viewMode === "summaries" ? statsQuery.data?.overview : null;

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Attendance"
        description="Mark daily student attendance for enrolled classes, aligned to academic year, term, and timetable — with bulk actions and roll-up summaries."
        titleId="attendance-page-heading"
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            onClick={openCreateForm}
          >
            Record Attendance
          </Button>
        }
      />

      <AttendanceStats
        summary={metricsSummary}
        timetableSlots={metricsSlots}
        overview={metricsOverview}
        loading={
          (viewMode === "roster" && rosterLoading) ||
          (viewMode === "summaries" && statsLoading)
        }
      />

      <Panel
        title="Workspace Controls"
        description="Switch between take sheet, directory, and summary views."
      >
        <div className="space-y-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  type="button"
                  variant={viewMode === option.id ? "primary" : "secondary"}
                  size="sm"
                  className="w-auto"
                  onClick={() => setViewMode(option.id)}
                >
                  <Icon size={16} aria-hidden />
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Academic year"
              name="workspaceAcademicYearId"
              value={academicYearId}
              onChange={(event) => {
                setAcademicYearId(event.target.value);
                setTermId("");
                setClassId("");
              }}
              options={[
                { value: "", label: "Select academic year" },
                ...yearOptions,
              ]}
              disabled={yearsQuery.isLoading}
            />
            <SelectField
              label="Term"
              name="workspaceTermId"
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              options={[
                { value: "", label: "Select term" },
                ...termOptions,
              ]}
              disabled={!academicYearId || termsQuery.isLoading}
            />
            <SelectField
              label="Class"
              name="workspaceClassId"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              options={[
                {
                  value: "",
                  label:
                    viewMode === "roster" || summaryScope === "class"
                      ? "Select class"
                      : "All classes",
                },
                ...classOptions,
              ]}
              disabled={!academicYearId || classesQuery.isLoading}
            />
            <DatePickerField
              label="Attendance date"
              name="workspaceAttendanceDate"
              value={attendanceDate}
              onChange={(event) => setAttendanceDate(event.target.value)}
            />
          </div>
        </div>
      </Panel>

      {scopeHint ? (
        <EmptyState
          icon={ClipboardList}
          title="Select filters to continue"
          description={scopeHint}
        />
      ) : viewMode === "roster" ? (
        rosterError ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Roster unavailable"
            description={rosterError}
            actionLabel="Retry"
            onAction={() => rosterQuery.refetch()}
          />
        ) : (
          <AttendanceRoster
            rows={rosterRows}
            timetableSlots={metricsSlots}
            loading={rosterLoading}
            savingStudentId={savingStudentId}
            bulkLoading={bulkLoading}
            onStatusChange={handleRosterStatusChange}
            onBulkAction={handleBulkAction}
            onView={handleView}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
          />
        )
      ) : viewMode === "directory" ? (
        directoryError ? (
          <EmptyState
            icon={LayoutList}
            title="Directory unavailable"
            description={directoryError}
            actionLabel="Retry"
            onAction={() => directoryQuery.refetch()}
          />
        ) : (
          <AttendanceList
            rows={directoryRows}
            loading={directoryLoading}
            page={page}
            pageSize={pageSize}
            total={directoryQuery.data?.pagination?.total ?? directoryRows.length}
            search={search}
            status={status}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onSortChange={({ key, direction }) => {
              setSortKey(key);
              setSortDirection(direction);
            }}
            onView={handleView}
            onEdit={(row) => openEditForm(row)}
            onDelete={(row) => {
              setDeleteError("");
              setDeleteTarget(row);
            }}
            onAdd={openCreateForm}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            emptyActionLabel="Record Attendance"
            onEmptyAction={openCreateForm}
          />
        )
      ) : (
        <AttendanceSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          stats={statsQuery.data}
          loading={statsLoading}
          teacherOptions={teacherOptions}
          studentOptions={studentOptions}
          teacherId={summaryTeacherId}
          studentId={summaryStudentId}
          onTeacherChange={setSummaryTeacherId}
          onStudentChange={setSummaryStudentId}
        />
      )}

      <AttendanceProfile
        open={profileOpen}
        recordId={profileRecordId}
        onClose={() => {
          setProfileOpen(false);
          setProfileRecordId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <AttendanceForm
        open={formOpen}
        mode={formMode}
        record={formMode === "edit" ? editingRecord : null}
        defaults={{
          academicYearId,
          termId,
          classId,
          attendanceDate,
        }}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <AttendanceDeleteDialog
        open={Boolean(deleteTarget)}
        record={deleteTarget}
        loading={deleting}
        error={deleteError}
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
