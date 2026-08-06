import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  FileCheck2,
  LayoutList,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import {
  archiveAssessment,
  getArchivedAssessments,
  getAssessmentById,
  getAssessmentStats,
  getAssessments,
  restoreAssessment,
} from "../../services/assessments/assessment.service";
import { getClasses } from "../../services/classes/class.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTeachers } from "../../services/teachers/teacher.service";
import { getTerms } from "../../services/terms/term.service";
import AssessmentDeleteDialog from "./AssessmentDeleteDialog";
import AssessmentForm from "./AssessmentForm";
import AssessmentList from "./AssessmentList";
import AssessmentProfile from "./AssessmentProfile";
import AssessmentScores from "./AssessmentScores";
import AssessmentStats from "./AssessmentStats";
import AssessmentSummaries from "./AssessmentSummaries";
import {
  exportAssessmentsToExcel,
  exportAssessmentsToPdf,
  printAssessments,
} from "./assessment.export";
import {
  formatClassLabel,
  formatSubjectLabel,
  formatTeacherName,
  getApiErrorMessage,
  mapAssessmentToRow,
  todayDateInputValue,
} from "./assessment.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "directory", label: "Directory", icon: LayoutList },
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
 * Assessment workspace — directory, score entry, analytics, archive/restore.
 */
export default function AssessmentPage() {
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
  const [assessmentType, setAssessmentType] = useState("all");
  const [sortKey, setSortKey] = useState("assessmentDateLabel");
  const [sortDirection, setSortDirection] = useState("desc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAssessmentId, setProfileAssessmentId] = useState(null);

  const [scoresOpen, setScoresOpen] = useState(false);
  const [scoresAssessmentId, setScoresAssessmentId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingAssessment, setEditingAssessment] = useState(null);

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
      `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${teacherId}|${debouncedSearch}|${status}|${assessmentType}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${teacherId}|${debouncedSearch}|${status}|${assessmentType}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "assessment-workspace"],
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
    queryKey: ["terms", "assessment-workspace", academicYearId],
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
    queryKey: ["classes", "assessment-workspace", academicYearId],
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
    queryKey: ["subjects", "assessment-workspace"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "assessment-workspace"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const listReady =
    (viewMode === "directory" || viewMode === "archived") &&
    Boolean(academicYearId && termId);

  const listQuery = useQuery({
    queryKey: [
      "assessments",
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
      assessmentType,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        academicYearId,
        termId,
        search: debouncedSearch || undefined,
        sortBy: "assessmentDate",
        sortOrder: sortDirection,
      };
      if (classId) params.classId = classId;
      if (subjectId) params.subjectId = subjectId;
      if (teacherId) params.teacherId = teacherId;
      if (assessmentType !== "all") params.assessmentType = assessmentType;
      if (viewMode === "directory" && status !== "all") {
        params.status = status === "Active" ? "ACTIVE" : "INACTIVE";
      }

      const response =
        viewMode === "archived"
          ? await getArchivedAssessments(params)
          : await getAssessments(params);
      return response;
    },
    enabled: listReady,
    placeholderData: keepPreviousData,
  });

  const analyticsReady =
    viewMode === "analytics" && Boolean(academicYearId && termId);

  const statsQuery = useQuery({
    queryKey: [
      "assessments",
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
      const response = await getAssessmentStats(params);
      return response?.data ?? null;
    },
    enabled: analyticsReady,
    placeholderData: keepPreviousData,
  });

  const refreshAssessments = () => {
    queryClient.invalidateQueries({ queryKey: ["assessments"] });
  };

  const rows = useMemo(() => {
    const records = listQuery.data?.data ?? [];
    return sortRows(records.map(mapAssessmentToRow), sortKey, sortDirection);
  }, [listQuery.data, sortKey, sortDirection]);

  const listLoading = listQuery.isLoading && !listQuery.data;
  const statsLoading = statsQuery.isLoading && !statsQuery.data;
  const listError = listQuery.isError
    ? getApiErrorMessage(listQuery.error, "Unable to load assessments.")
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
    setEditingAssessment(null);
    setFormOpen(true);
  };

  const openEditForm = async (assessmentLike) => {
    const id = assessmentLike?.id;
    if (!id) return;
    setProfileOpen(false);
    try {
      const response = await getAssessmentById(id);
      setEditingAssessment(response?.data ?? assessmentLike);
    } catch {
      setEditingAssessment(assessmentLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileAssessmentId(row.id);
    setProfileOpen(true);
  };

  const handleScores = (rowOrAssessment) => {
    const id = rowOrAssessment?.id;
    if (!id) return;
    setProfileOpen(false);
    setScoresAssessmentId(id);
    setScoresOpen(true);
  };

  const handleFormSuccess = (_assessment, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Assessment updated successfully."
          : "Assessment created successfully.")
    );
    refreshAssessments();
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return;
    setArchiving(true);
    setArchiveError("");
    try {
      const response = await archiveAssessment(archiveTarget.id);
      toastSuccess(
        response?.message || "Assessment archived successfully."
      );
      setArchiveTarget(null);
      refreshAssessments();
    } catch (error) {
      setArchiveError(
        getApiErrorMessage(error, "Unable to archive assessment.")
      );
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreAssessment(row.id);
      toastSuccess(
        response?.message || "Assessment restored successfully."
      );
      refreshAssessments();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to restore assessment."));
    }
  };

  const handleExportExcel = () => {
    if (!rows.length) {
      toastError("No assessments to export.");
      return;
    }
    exportAssessmentsToExcel(rows, `assessments-${viewMode}.xlsx`);
    toastSuccess("Excel export ready.");
  };

  const handleExportPdf = () => {
    if (!rows.length) {
      toastError("No assessments to export.");
      return;
    }
    exportAssessmentsToPdf(rows, `assessments-${viewMode}.pdf`);
    toastSuccess("PDF export ready.");
  };

  const handlePrint = () => {
    if (!rows.length) {
      toastError("No assessments to print.");
      return;
    }
    printAssessments(rows);
  };

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to continue."
      : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Assessments"
        description="Create class assessments, enter scores for enrolled students, and review analytics — with teacher assignment and mark-limit enforcement."
        titleId="assessments-page-heading"
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            onClick={openCreateForm}
          >
            New Assessment
          </Button>
        }
      />

      <AssessmentStats
        rows={viewMode === "directory" ? rows : []}
        overview={viewMode === "analytics" ? statsQuery.data?.overview : null}
        loading={
          (viewMode === "directory" && listLoading) ||
          (viewMode === "analytics" && statsLoading)
        }
      />

      <Panel
        title="Workspace Controls"
        description="Scope assessments by academic year, term, class, subject, and teacher."
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
        <AssessmentSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          stats={statsQuery.data}
          loading={statsLoading}
        />
      ) : listError ? (
        <EmptyState
          icon={FileCheck2}
          title="Assessments unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() => listQuery.refetch()}
        />
      ) : (
        <AssessmentList
          title={
            viewMode === "archived"
              ? "Archived Assessments"
              : "Assessment Directory"
          }
          description={
            viewMode === "archived"
              ? "Soft-archived assessments that can be restored."
              : "Active and inactive assessments for the selected scope."
          }
          rows={rows}
          loading={listLoading}
          page={page}
          pageSize={pageSize}
          total={listQuery.data?.pagination?.total ?? rows.length}
          search={search}
          status={status}
          assessmentType={assessmentType}
          sortKey={sortKey}
          sortDirection={sortDirection}
          archivedView={viewMode === "archived"}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onTypeChange={setAssessmentType}
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
          onAdd={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          emptyActionLabel="New Assessment"
          onEmptyAction={
            viewMode === "archived" ? undefined : openCreateForm
          }
        />
      )}

      <AssessmentProfile
        open={profileOpen}
        assessmentId={profileAssessmentId}
        onClose={() => {
          setProfileOpen(false);
          setProfileAssessmentId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
        onScores={handleScores}
      />

      <AssessmentScores
        open={scoresOpen}
        assessmentId={scoresAssessmentId}
        onClose={() => {
          setScoresOpen(false);
          setScoresAssessmentId(null);
        }}
        onSaved={(message) => {
          toastSuccess(message);
          refreshAssessments();
        }}
      />

      <AssessmentForm
        open={formOpen}
        mode={formMode}
        assessment={formMode === "edit" ? editingAssessment : null}
        defaults={{
          academicYearId,
          termId,
          classId,
          subjectId,
          teacherId,
          assessmentDate: todayDateInputValue(),
        }}
        onClose={() => {
          setFormOpen(false);
          setEditingAssessment(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <AssessmentDeleteDialog
        open={Boolean(archiveTarget)}
        assessment={archiveTarget}
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
