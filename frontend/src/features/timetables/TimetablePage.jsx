import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookOpen,
  CalendarClock,
  Grid3x3,
  School,
  Users,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import { getTerms } from "../../services/terms/term.service";
import {
  deleteTimetable,
  getTimetableById,
  getTimetableView,
} from "../../services/timetables/timetable.service";
import TimetableDeleteDialog from "./TimetableDeleteDialog";
import TimetableForm from "./TimetableForm";
import TimetableGrid from "./TimetableGrid";
import TimetableList from "./TimetableList";
import TimetableProfile from "./TimetableProfile";
import TimetableStats from "./TimetableStats";
import {
  exportTimetablesToExcel,
  exportTimetablesToPdf,
  printTimetables,
} from "./timetable.export";
import {
  formatClassLabel,
  formatSubjectLabel,
  formatTeacherName,
  getApiErrorMessage,
  mapTimetableToRow,
} from "./timetable.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "grid", label: "Grid", icon: Grid3x3 },
  { id: "class", label: "Class", icon: School },
  { id: "teacher", label: "Teacher", icon: Users },
  { id: "subject", label: "Subject", icon: BookOpen },
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

function applyStatusFilter(rows, status) {
  if (status === "all") return rows;
  return rows.filter((row) => row.status === status);
}

function applySearchFilter(rows, search) {
  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter(
    (row) =>
      row.className.toLowerCase().includes(needle) ||
      row.classCode.toLowerCase().includes(needle) ||
      row.subjectName.toLowerCase().includes(needle) ||
      row.subjectCode.toLowerCase().includes(needle) ||
      row.teacherName.toLowerCase().includes(needle) ||
      row.room.toLowerCase().includes(needle) ||
      row.dayLabel.toLowerCase().includes(needle) ||
      row.timeRange.toLowerCase().includes(needle)
  );
}

/**
 * Timetable workspace — Grid, Class, Teacher, and Subject views.
 */
export default function TimetablePage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("grid");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("dayLabel");
  const [sortDirection, setSortDirection] = useState("asc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEntryId, setProfileEntryId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingEntry, setEditingEntry] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const [filterKey, setFilterKey] = useState(
    () =>
      `${viewMode}|${academicYearId}|${termId}|${classId}|${teacherId}|${subjectId}|${debouncedSearch}|${status}|${pageSize}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${teacherId}|${subjectId}|${debouncedSearch}|${status}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "timetable-workspace"],
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
    queryKey: ["terms", "timetable-workspace", academicYearId],
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
    queryKey: ["classes", "timetable-workspace", academicYearId],
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
    queryKey: ["teachers", "timetable-workspace"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", "timetable-workspace"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const viewReady =
    Boolean(academicYearId && termId) &&
    (viewMode === "grid" ||
      (viewMode === "class" && Boolean(classId)) ||
      (viewMode === "teacher" && Boolean(teacherId)) ||
      (viewMode === "subject" && Boolean(subjectId)));

  const viewQuery = useQuery({
    queryKey: [
      "timetables",
      "view",
      viewMode,
      academicYearId,
      termId,
      classId,
      teacherId,
      subjectId,
    ],
    queryFn: async () => {
      const params = {
        view: viewMode,
        academicYearId,
        termId,
        status: "ACTIVE",
      };
      if (classId) params.classId = classId;
      if (teacherId) params.teacherId = teacherId;
      if (subjectId) params.subjectId = subjectId;
      const response = await getTimetableView(params);
      return response?.data ?? null;
    },
    enabled: viewReady,
    placeholderData: keepPreviousData,
  });

  const refreshTimetables = () => {
    queryClient.invalidateQueries({ queryKey: ["timetables"] });
  };

  const mappedEntries = useMemo(() => {
    const entries = viewQuery.data?.entries ?? [];
    return entries.map(mapTimetableToRow);
  }, [viewQuery.data]);

  const filteredRows = useMemo(() => {
    return sortRows(
      applyStatusFilter(applySearchFilter(mappedEntries, debouncedSearch), status),
      sortKey,
      sortDirection
    );
  }, [mappedEntries, debouncedSearch, status, sortKey, sortDirection]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const listLoading = viewQuery.isLoading && !viewQuery.data;
  const listError = viewQuery.isError
    ? getApiErrorMessage(
        viewQuery.error,
        "Unable to load timetable. Please try again."
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

  const subjectOptions = (subjectsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatSubjectLabel(item),
  }));

  const openCreateForm = () => {
    setFormMode("create");
    setEditingEntry(null);
    setFormOpen(true);
  };

  const openEditForm = async (entryLike) => {
    const id = entryLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getTimetableById(id);
      setEditingEntry(response?.data ?? entryLike);
    } catch {
      setEditingEntry(entryLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileEntryId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_entry, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Timetable slot updated successfully."
          : "Timetable slot created successfully.")
    );
    refreshTimetables();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteTimetable(deleteTarget.id);
      toastSuccess(
        response?.message || "Timetable slot deleted successfully."
      );
      setDeleteTarget(null);
      refreshTimetables();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to delete timetable slot. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (!filteredRows.length) {
      toastError("No timetable slots to export.");
      return;
    }
    exportTimetablesToExcel(filteredRows, `timetable-${viewMode}.xlsx`);
    toastSuccess("Excel export ready.");
  };

  const handleExportPdf = () => {
    if (!filteredRows.length) {
      toastError("No timetable slots to export.");
      return;
    }
    exportTimetablesToPdf(filteredRows, `timetable-${viewMode}.pdf`);
    toastSuccess("PDF export ready.");
  };

  const handlePrint = () => {
    if (!filteredRows.length) {
      toastError("No timetable slots to print.");
      return;
    }
    printTimetables(filteredRows);
  };

  const listTitle =
    viewMode === "class"
      ? "Class Timetable"
      : viewMode === "teacher"
        ? "Teacher Timetable"
        : viewMode === "subject"
          ? "Subject Timetable"
          : "Timetable Directory";

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to load the timetable."
      : viewMode === "class" && !classId
        ? "Select a class to view its timetable."
        : viewMode === "teacher" && !teacherId
          ? "Select a teacher to view their timetable."
          : viewMode === "subject" && !subjectId
            ? "Select a subject to view its timetable."
            : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Timetable"
        description="Schedule class periods with clash detection against class, teacher, and room — scoped by academic year and term."
        titleId="timetables-page-heading"
      />

      <TimetableStats
        entries={mappedEntries}
        loading={listLoading}
      />

      <Panel
        title="Workspace Controls"
        description="Switch views and scope by academic year, term, and entity."
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
                  disabled={listLoading}
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
            {(viewMode === "grid" || viewMode === "class") && (
              <SelectField
                label="Class"
                name="workspaceClassId"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                options={[
                  {
                    value: "",
                    label:
                      viewMode === "class"
                        ? "Select class"
                        : "All classes (grid)",
                  },
                  ...classOptions,
                ]}
                disabled={!academicYearId || classesQuery.isLoading}
              />
            )}
            {(viewMode === "grid" || viewMode === "teacher") && (
              <SelectField
                label="Teacher"
                name="workspaceTeacherId"
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                options={[
                  {
                    value: "",
                    label:
                      viewMode === "teacher"
                        ? "Select teacher"
                        : "All teachers (optional)",
                  },
                  ...teacherOptions,
                ]}
                disabled={teachersQuery.isLoading}
              />
            )}
            {(viewMode === "grid" || viewMode === "subject") && (
              <SelectField
                label="Subject"
                name="workspaceSubjectId"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                options={[
                  {
                    value: "",
                    label:
                      viewMode === "subject"
                        ? "Select subject"
                        : "All subjects (optional)",
                  },
                  ...subjectOptions,
                ]}
                disabled={subjectsQuery.isLoading}
              />
            )}
          </div>
        </div>
      </Panel>

      {scopeHint ? (
        <EmptyState
          icon={CalendarClock}
          title="Select filters to continue"
          description={scopeHint}
        />
      ) : listError ? (
        <EmptyState
          icon={CalendarClock}
          title="Timetable unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() => viewQuery.refetch()}
        />
      ) : viewMode === "grid" ? (
        <TimetableGrid
          entries={filteredRows}
          loading={listLoading}
          onView={handleView}
          onEdit={(row) => openEditForm({ id: row.id })}
          onDelete={(row) => {
            setDeleteError("");
            setDeleteTarget(row);
          }}
          onAdd={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
        />
      ) : (
        <TimetableList
          title={listTitle}
          description="Scheduled periods for the selected scope."
          rows={pageRows}
          loading={listLoading}
          page={page}
          pageSize={pageSize}
          total={filteredRows.length}
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
          onEdit={(row) => openEditForm({ id: row.id })}
          onDelete={(row) => {
            setDeleteError("");
            setDeleteTarget(row);
          }}
          onAdd={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          emptyActionLabel="Add Slot"
          onEmptyAction={openCreateForm}
        />
      )}

      <TimetableProfile
        open={profileOpen}
        entryId={profileEntryId}
        onClose={() => {
          setProfileOpen(false);
          setProfileEntryId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <TimetableForm
        open={formOpen}
        mode={formMode}
        entry={formMode === "edit" ? editingEntry : null}
        defaults={{
          academicYearId,
          termId,
          classId,
        }}
        onClose={() => {
          setFormOpen(false);
          setEditingEntry(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <TimetableDeleteDialog
        open={Boolean(deleteTarget)}
        entry={deleteTarget}
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
