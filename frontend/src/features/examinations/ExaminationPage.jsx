import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  ClipboardList,
  FileCheck2,
  LayoutList,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  archiveExamination,
  getArchivedExaminations,
  getExaminationById,
  getExaminationStats,
  getExaminations,
  lockExamination,
  restoreExamination,
  unlockExamination,
} from "../../services/examinations/examination.service";
import { getClasses } from "../../services/classes/class.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import { getTerms } from "../../services/terms/term.service";
import ExaminationDeleteDialog from "./ExaminationDeleteDialog";
import ExaminationForm from "./ExaminationForm";
import ExaminationList from "./ExaminationList";
import ExaminationProfile from "./ExaminationProfile";
import ExaminationScores from "./ExaminationScores";
import ExaminationStats from "./ExaminationStats";
import ExaminationSummaries from "./ExaminationSummaries";
import {
  exportExaminationsToExcel,
  exportExaminationsToPdf,
  printExaminations,
} from "./examination.export";
import {
  formatClassLabel,
  formatSubjectLabel,
  formatTeacherName,
  getApiErrorMessage,
  mapExaminationToRow,
  todayDateInputValue,
} from "./examination.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "directory", label: "Directory", icon: LayoutList },
  { id: "results", label: "Student Results", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "archived", label: "Archived", icon: Archive },
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
 * Examination workspace — directory, score entry, analytics, archive/restore.
 */
export default function ExaminationPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("directory");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [summaryScope, setSummaryScope] = useState("overview");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [examinationType, setExaminationType] = useState("all");
  const [sortKey, setSortKey] = useState("examinationDateLabel");
  const [sortDirection, setSortDirection] = useState("desc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileExaminationId, setProfileExaminationId] = useState(null);

  const [scoresOpen, setScoresOpen] = useState(false);
  const [scoresExaminationId, setScoresExaminationId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingExamination, setEditingExamination] = useState(null);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const [filterKey, setFilterKey] = useState(
    () =>
      `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${teacherId}|${debouncedSearch}|${status}|${examinationType}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${teacherId}|${debouncedSearch}|${status}|${examinationType}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "examination-workspace"],
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
    queryKey: ["terms", "examination-workspace", academicYearId],
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
    queryKey: ["classes", "examination-workspace", academicYearId],
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

  const subjectsQuery = useQuery({
    queryKey: ["subjects", "examination-workspace"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "examination-workspace"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const listReady =
    (viewMode === "directory" ||
      viewMode === "results" ||
      viewMode === "archived") &&
    Boolean(academicYearId && termId);

  const listQuery = useQuery({
    queryKey: [
      "examinations",
      viewMode,
      academicYearId,
      termId,
      classId,
      subjectId,
      teacherId,
      page,
      pageSize,
      debouncedSearch,
      status,
      examinationType,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        academicYearId,
        termId,
        search: debouncedSearch || undefined,
        sortBy: "examinationDate",
        sortOrder: sortDirection,
      };
      if (classId) params.classId = classId;
      if (subjectId) params.subjectId = subjectId;
      if (teacherId) params.teacherId = teacherId;
      if (examinationType !== "all") params.examinationType = examinationType;
      if (
        (viewMode === "directory" || viewMode === "results") &&
        status !== "all"
      ) {
        params.status = status === "Active" ? "ACTIVE" : "INACTIVE";
      }

      const response =
        viewMode === "archived"
          ? await getArchivedExaminations(params)
          : await getExaminations(params);
      return response;
    },
    enabled: listReady,
    placeholderData: keepPreviousData,
  });

  const analyticsReady =
    viewMode === "analytics" && Boolean(academicYearId && termId);

  const statsQuery = useQuery({
    queryKey: [
      "examinations",
      "stats",
      summaryScope,
      academicYearId,
      termId,
      classId,
      subjectId,
      teacherId,
    ],
    queryFn: async () => {
      const params = {
        scope: summaryScope,
        academicYearId,
        termId,
      };
      if (classId) params.classId = classId;
      if (subjectId) params.subjectId = subjectId;
      if (teacherId) params.teacherId = teacherId;
      const response = await getExaminationStats(params);
      return response?.data ?? null;
    },
    enabled: analyticsReady,
    placeholderData: keepPreviousData,
  });

  const refreshExaminations = () => {
    queryClient.invalidateQueries({ queryKey: ["examinations"] });
  };

  const rows = useMemo(() => {
    const records = listQuery.data?.data ?? [];
    return sortRows(records.map(mapExaminationToRow), sortKey, sortDirection);
  }, [listQuery.data, sortKey, sortDirection]);

  const listLoading = listQuery.isLoading && !listQuery.data;
  const statsLoading = statsQuery.isLoading && !statsQuery.data;
  const listError = listQuery.isError
    ? getApiErrorMessage(listQuery.error, "Unable to load examinations.")
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

  const subjectOptions = (subjectsQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatSubjectLabel(item),
  }));

  const teacherOptions = (teachersQuery.data ?? []).map((item) => ({
    value: String(item.id),
    label: formatTeacherName(item),
  }));

  const openCreateForm = () => {
    setFormMode("create");
    setEditingExamination(null);
    setFormOpen(true);
  };

  const openEditForm = async (examinationLike) => {
    const id = examinationLike?.id;
    if (!id) return;
    setProfileOpen(false);
    try {
      const response = await getExaminationById(id);
      setEditingExamination(response?.data ?? examinationLike);
    } catch {
      setEditingExamination(examinationLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileExaminationId(row.id);
    setProfileOpen(true);
  };

  const handleScores = (rowOrExamination) => {
    const id = rowOrExamination?.id;
    if (!id) return;
    setProfileOpen(false);
    setScoresExaminationId(id);
    setScoresOpen(true);
  };

  const handleFormSuccess = (_examination, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Examination updated successfully."
          : "Examination created successfully.")
    );
    refreshExaminations();
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return;
    setArchiving(true);
    setArchiveError("");
    try {
      const response = await archiveExamination(archiveTarget.id);
      toastSuccess(
        response?.message || "Examination archived successfully."
      );
      setArchiveTarget(null);
      refreshExaminations();
    } catch (error) {
      setArchiveError(
        getApiErrorMessage(error, "Unable to archive examination.")
      );
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreExamination(row.id);
      toastSuccess(
        response?.message || "Examination restored successfully."
      );
      refreshExaminations();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to restore examination."));
    }
  };

  const handleToggleLock = async (examination) => {
    try {
      const response = examination.isLocked
        ? await unlockExamination(examination.id)
        : await lockExamination(examination.id);
      toastSuccess(
        response?.message ||
          `Examination ${examination.isLocked ? "unlocked" : "locked"} successfully.`
      );
      refreshExaminations();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          `Unable to ${examination.isLocked ? "unlock" : "lock"} examination.`
        )
      );
    }
  };

  const handleExportExcel = () => {
    if (!rows.length) {
      toastError("No examinations to export.");
      return;
    }
    exportExaminationsToExcel(rows, `examinations-${viewMode}.xlsx`);
    toastSuccess("Excel export ready.");
  };

  const handleExportPdf = () => {
    if (!rows.length) {
      toastError("No examinations to export.");
      return;
    }
    exportExaminationsToPdf(rows, `examinations-${viewMode}.pdf`);
    toastSuccess("PDF export ready.");
  };

  const handlePrint = () => {
    if (!rows.length) {
      toastError("No examinations to print.");
      return;
    }
    printExaminations(rows);
  };

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to continue."
      : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Examinations"
        description="Create class examinations, enter scores for enrolled students, and review analytics — with teacher assignment and mark-limit enforcement."
        titleId="examinations-page-heading"
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            onClick={openCreateForm}
          >
            New Examination
          </Button>
        }
      />

      <ExaminationStats
        rows={
          viewMode === "directory" || viewMode === "results" ? rows : []
        }
        overview={viewMode === "analytics" ? statsQuery.data?.overview : null}
        loading={
          ((viewMode === "directory" || viewMode === "results") &&
            listLoading) ||
          (viewMode === "analytics" && statsLoading)
        }
      />

      <Panel
        title="Workspace Controls"
        description="Scope examinations by academic year, term, class, subject, and teacher."
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

          <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2 xl:grid-cols-5">
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
                { value: "", label: "All classes" },
                ...classOptions,
              ]}
              disabled={!academicYearId || classesQuery.isLoading}
            />
            <SelectField
              label="Subject"
              name="workspaceSubjectId"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              options={[
                { value: "", label: "All subjects" },
                ...subjectOptions,
              ]}
              disabled={subjectsQuery.isLoading}
            />
            <SelectField
              label="Teacher"
              name="workspaceTeacherId"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              options={[
                { value: "", label: "All teachers" },
                ...teacherOptions,
              ]}
              disabled={teachersQuery.isLoading}
            />
          </div>
        </div>
      </Panel>

      {scopeHint ? (
        <EmptyState
          icon={FileCheck2}
          title="Select filters to continue"
          description={scopeHint}
        />
      ) : viewMode === "analytics" ? (
        <ExaminationSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          stats={statsQuery.data}
          loading={statsLoading}
        />
      ) : listError ? (
        <EmptyState
          icon={FileCheck2}
          title="Examinations unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() => listQuery.refetch()}
        />
      ) : (
        <ExaminationList
          title={
            viewMode === "archived"
              ? "Archived Examinations"
              : viewMode === "results"
                ? "Student Results"
                : "Examination Directory"
          }
          description={
            viewMode === "archived"
              ? "Soft-archived examinations that can be restored."
              : viewMode === "results"
                ? "Open an examination to enter or review marks against the passing threshold."
                : "Active and inactive examinations for the selected scope."
          }
          rows={rows}
          loading={listLoading}
          page={page}
          pageSize={pageSize}
          total={listQuery.data?.pagination?.total ?? rows.length}
          search={search}
          status={status}
          examinationType={examinationType}
          sortKey={sortKey}
          sortDirection={sortDirection}
          archivedView={viewMode === "archived"}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onTypeChange={setExaminationType}
          onSortChange={({ key, direction }) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          onView={handleView}
          onEdit={(row) => openEditForm(row)}
          onScores={handleScores}
          onArchive={(row) => {
            setArchiveError("");
            setArchiveTarget(row);
          }}
          onRestore={handleRestore}
          onToggleLock={handleToggleLock}
          onAdd={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          emptyActionLabel="New Examination"
          onEmptyAction={
            viewMode === "archived" ? undefined : openCreateForm
          }
        />
      )}

      <ExaminationProfile
        open={profileOpen}
        examinationId={profileExaminationId}
        onClose={() => {
          setProfileOpen(false);
          setProfileExaminationId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
        onScores={handleScores}
        onToggleLock={handleToggleLock}
        onArchive={(detail) => {
          setProfileOpen(false);
          setArchiveError("");
          setArchiveTarget(detail);
        }}
      />

      <ExaminationScores
        open={scoresOpen}
        examinationId={scoresExaminationId}
        onClose={() => {
          setScoresOpen(false);
          setScoresExaminationId(null);
        }}
        onSaved={(message) => {
          toastSuccess(message);
          refreshExaminations();
        }}
      />

      <ExaminationForm
        open={formOpen}
        mode={formMode}
        examination={formMode === "edit" ? editingExamination : null}
        defaults={{
          academicYearId,
          termId,
          classId,
          subjectId,
          teacherId,
          examinationDate: todayDateInputValue(),
        }}
        onClose={() => {
          setFormOpen(false);
          setEditingExamination(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <ExaminationDeleteDialog
        open={Boolean(archiveTarget)}
        examination={archiveTarget}
        loading={archiving}
        error={archiveError}
        onCancel={() => {
          if (archiving) return;
          setArchiveTarget(null);
          setArchiveError("");
        }}
        onConfirm={handleConfirmArchive}
      />
    </div>
  );
}
