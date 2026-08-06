import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  LayoutList,
  RefreshCw,
  Sparkles,
  Table2,
  Trophy,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import {
  archiveResult,
  getArchivedResults,
  getResultBroadsheet,
  getResultMeritList,
  getResultStats,
  getResultWeightings,
  getResults,
  lockResults,
  publishResults,
  recalculatePositions,
  restoreResult,
  unlockResults,
  unpublishResults,
  unverifyResults,
  verifyResults,
} from "../../services/results/result.service";
import { getSubjects } from "../../services/subjects/subject.service";
import { getTerms } from "../../services/terms/term.service";
import ResultBroadsheet from "./ResultBroadsheet";
import ResultDeleteDialog from "./ResultDeleteDialog";
import ResultGenerateForm from "./ResultGenerateForm";
import ResultList from "./ResultList";
import ResultMeritList from "./ResultMeritList";
import ResultProfile from "./ResultProfile";
import ResultStats from "./ResultStats";
import ResultSummaries from "./ResultSummaries";
import StudentResultProfile from "./StudentResultProfile";
import {
  exportResultsToCsv,
  exportResultsToExcel,
  exportResultsToPdf,
  printResults,
} from "./result.export";
import {
  formatClassLabel,
  formatSubjectLabel,
  getApiErrorMessage,
  mapResultToRow,
} from "./result.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "directory", label: "Directory", icon: LayoutList },
  { id: "broadsheet", label: "Broadsheet", icon: Table2 },
  { id: "merit", label: "Merit List", icon: Trophy },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "archived", label: "Archived", icon: Archive },
];

const WRITE_ROLES = new Set([
  "Administrator",
  "Headmaster",
  "Registrar",
  "Teacher",
]);
const VERIFY_ROLES = new Set(["Administrator", "Headmaster", "Registrar"]);

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
 * Results Engine workspace — generate, verify, publish/lock, reports, analytics.
 */
export default function ResultPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const roleName = user?.role?.name || "";
  const canGenerate = WRITE_ROLES.has(roleName);
  const canVerify = VERIFY_ROLES.has(roleName);
  const canPublish = WRITE_ROLES.has(roleName);
  const canLock = WRITE_ROLES.has(roleName);
  const canArchive = WRITE_ROLES.has(roleName);
  const isAdmin = roleName === "Administrator";

  const [viewMode, setViewMode] = useState("directory");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [summaryScope, setSummaryScope] = useState("overview");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [passFilter, setPassFilter] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [sortKey, setSortKey] = useState("finalScoreLabel");
  const [sortDirection, setSortDirection] = useState("desc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileResultId, setProfileResultId] = useState(null);

  const [studentProfileOpen, setStudentProfileOpen] = useState(false);
  const [studentProfileId, setStudentProfileId] = useState(null);

  const [generateOpen, setGenerateOpen] = useState(false);

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
      `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${debouncedSearch}|${passFilter}|${workflowFilter}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${subjectId}|${debouncedSearch}|${passFilter}|${workflowFilter}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "result-workspace"],
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
    queryKey: ["terms", "result-workspace", academicYearId],
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
    queryKey: ["classes", "result-workspace", academicYearId],
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
    queryKey: ["subjects", "result-workspace"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const weightingsQuery = useQuery({
    queryKey: ["results", "weightings"],
    queryFn: async () => {
      const response = await getResultWeightings();
      return response?.data ?? null;
    },
  });

  const listEnabled =
    Boolean(academicYearId && termId) &&
    (viewMode === "directory" || viewMode === "archived");

  const listQuery = useQuery({
    queryKey: [
      "results",
      viewMode,
      academicYearId,
      termId,
      classId,
      subjectId,
      debouncedSearch,
      passFilter,
      workflowFilter,
      page,
      pageSize,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        academicYearId: academicYearId || undefined,
        termId: termId || undefined,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
        isPassed: passFilter === "all" ? undefined : passFilter,
        workflowStatus: workflowFilter === "all" ? undefined : workflowFilter,
      };
      if (viewMode === "archived") {
        return getArchivedResults(params);
      }
      return getResults(params);
    },
    enabled: listEnabled,
    placeholderData: keepPreviousData,
  });

  const reportEnabled = Boolean(
    academicYearId && termId && classId && (viewMode === "broadsheet" || viewMode === "merit")
  );

  const broadsheetQuery = useQuery({
    queryKey: ["results", "broadsheet", academicYearId, termId, classId, subjectId],
    queryFn: async () => {
      const response = await getResultBroadsheet({
        academicYearId: Number(academicYearId),
        termId: Number(termId),
        classId: Number(classId),
        subjectId: subjectId ? Number(subjectId) : undefined,
      });
      return response?.data ?? null;
    },
    enabled: reportEnabled && viewMode === "broadsheet",
  });

  const meritQuery = useQuery({
    queryKey: ["results", "merit-list", academicYearId, termId, classId],
    queryFn: async () => {
      const response = await getResultMeritList({
        academicYearId: Number(academicYearId),
        termId: Number(termId),
        classId: Number(classId),
        limit: 50,
      });
      return response?.data ?? null;
    },
    enabled: reportEnabled && viewMode === "merit",
  });

  const statsQuery = useQuery({
    queryKey: [
      "results",
      "stats",
      summaryScope,
      academicYearId,
      termId,
      classId,
      subjectId,
    ],
    queryFn: async () => {
      const response = await getResultStats({
        scope: summaryScope,
        academicYearId: academicYearId || undefined,
        termId: termId || undefined,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
      });
      return response?.data ?? null;
    },
    enabled: Boolean(academicYearId && termId && viewMode === "analytics"),
  });

  const refreshResults = () => {
    queryClient.invalidateQueries({ queryKey: ["results"] });
  };

  const rows = useMemo(() => {
    const mapped = (listQuery.data?.data ?? []).map(mapResultToRow);
    return sortRows(mapped, sortKey, sortDirection);
  }, [listQuery.data, sortKey, sortDirection]);

  const listLoading = listQuery.isLoading || listQuery.isFetching;
  const statsLoading = statsQuery.isLoading || statsQuery.isFetching;
  const broadsheetLoading =
    broadsheetQuery.isLoading || broadsheetQuery.isFetching;
  const meritLoading = meritQuery.isLoading || meritQuery.isFetching;
  const listError = listQuery.isError
    ? getApiErrorMessage(listQuery.error, "Unable to load results.")
    : "";

  const yearOptions = (yearsQuery.data || []).map((year) => ({
    value: String(year.id),
    label: year.name,
  }));
  const termOptions = (termsQuery.data || []).map((term) => ({
    value: String(term.id),
    label: term.name || term.code,
  }));
  const classOptions = (classesQuery.data || []).map((item) => ({
    value: String(item.id),
    label: formatClassLabel(item),
  }));
  const subjectOptions = (subjectsQuery.data || []).map((item) => ({
    value: String(item.id),
    label: formatSubjectLabel(item),
  }));

  const weights = weightingsQuery.data;
  const weightsHint = weights
    ? `Weights ${weights.caWeight}% CA / ${weights.examWeight}% Exam · Pass mark ${weights.passMark}`
    : "Weights load from System Settings (default 40% CA / 60% Exam).";

  const openGenerate = () => setGenerateOpen(true);

  const handleView = (row) => {
    setProfileResultId(row.id);
    setProfileOpen(true);
  };

  const handleViewStudent = (row) => {
    const id = row.studentId || row.id;
    if (!id) {
      toastError("Student id is missing for this row.");
      return;
    }
    setStudentProfileId(id);
    setStudentProfileOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget?.id) return;
    setArchiving(true);
    setArchiveError("");
    try {
      await archiveResult(archiveTarget.id);
      toastSuccess("Result archived successfully.");
      setArchiveTarget(null);
      setProfileOpen(false);
      refreshResults();
    } catch (error) {
      setArchiveError(getApiErrorMessage(error, "Unable to archive result."));
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await restoreResult(row.id);
      toastSuccess("Result restored successfully.");
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to restore result."));
    }
  };

  const handleToggleVerify = async (row) => {
    const payload = { ids: [row.id] };
    try {
      if (row.isVerified && !row.isPublished && !row.isLocked) {
        await unverifyResults(payload);
        toastSuccess("Result unverified.");
      } else if (!row.isVerified) {
        await verifyResults(payload);
        toastSuccess("Result verified.");
      } else {
        toastError("Unpublish/unlock before changing verification.");
        return;
      }
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update verification."));
    }
  };

  const handleTogglePublish = async (row) => {
    const payload = { ids: [row.id] };
    try {
      if (row.isPublished) {
        await unpublishResults(payload);
        toastSuccess("Result unpublished.");
      } else {
        await publishResults(payload);
        toastSuccess("Result published.");
      }
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update publication state."));
    }
  };

  const handleToggleLock = async (row) => {
    const payload = { ids: [row.id] };
    try {
      if (row.isLocked) {
        await unlockResults(payload);
        toastSuccess("Result unlocked.");
      } else {
        await lockResults(payload);
        toastSuccess("Result locked.");
      }
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update lock state."));
    }
  };

  const requireClassScope = (actionLabel) => {
    if (!academicYearId || !termId || !classId) {
      toastError(`Select academic year, term, and class to ${actionLabel}.`);
      return false;
    }
    return true;
  };

  const scopePayload = () => ({
    academicYearId: Number(academicYearId),
    termId: Number(termId),
    classId: Number(classId),
    subjectId: subjectId ? Number(subjectId) : undefined,
  });

  const handleBulkVerify = async () => {
    if (!requireClassScope("verify by scope")) return;
    try {
      await verifyResults(scopePayload());
      toastSuccess("Results verified for the selected scope.");
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to verify results."));
    }
  };

  const handleBulkPublish = async () => {
    if (!requireClassScope("publish by scope")) return;
    try {
      await publishResults(scopePayload());
      toastSuccess("Results published for the selected scope.");
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to publish results."));
    }
  };

  const handleBulkLock = async () => {
    if (!requireClassScope("lock by scope")) return;
    try {
      await lockResults(scopePayload());
      toastSuccess("Results locked for the selected scope.");
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to lock results."));
    }
  };

  const handleRecalculate = async () => {
    if (!requireClassScope("recalculate positions")) return;
    try {
      const response = await recalculatePositions(scopePayload());
      toastSuccess(
        response?.message ||
          `Positions recalculated (${response?.data?.updated ?? 0} rows).`
      );
      refreshResults();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to recalculate positions."));
    }
  };

  const handleExportExcel = () => {
    if (!rows.length) {
      toastError("No results to export.");
      return;
    }
    exportResultsToExcel(rows, `results-${viewMode}.xlsx`);
  };

  const handleExportCsv = () => {
    if (!rows.length) {
      toastError("No results to export.");
      return;
    }
    exportResultsToCsv(rows, `results-${viewMode}.csv`);
  };

  const handleExportPdf = () => {
    if (!rows.length) {
      toastError("No results to export.");
      return;
    }
    exportResultsToPdf(rows, `results-${viewMode}.pdf`);
  };

  const handlePrint = () => {
    if (!rows.length) {
      toastError("No results to print.");
      return;
    }
    printResults(rows);
  };

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to continue."
      : (viewMode === "broadsheet" || viewMode === "merit") && !classId
        ? "Select a class to load the broadsheet or merit list."
        : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Results Engine"
        description="Generate final scores from Continuous Assessment and locked examinations, then verify, publish, rank, and analyse class outcomes."
        titleId="results-page-heading"
        actions={
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {canVerify ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={handleBulkVerify}
              >
                Verify Scope
              </Button>
            ) : null}
            {canPublish ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={handleBulkPublish}
              >
                Publish Scope
              </Button>
            ) : null}
            {canLock ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={handleBulkLock}
              >
                Lock Scope
              </Button>
            ) : null}
            {canGenerate ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={handleRecalculate}
              >
                <RefreshCw size={16} aria-hidden />
                Recalculate
              </Button>
            ) : null}
            {canGenerate ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                onClick={openGenerate}
              >
                <Sparkles size={16} aria-hidden />
                Generate Results
              </Button>
            ) : null}
          </div>
        }
      />

      <ResultStats
        rows={viewMode === "directory" ? rows : []}
        overview={viewMode === "analytics" ? statsQuery.data?.overview : null}
        loading={
          (viewMode === "directory" && listLoading) ||
          (viewMode === "analytics" && statsLoading)
        }
      />

      <Panel
        title="Workspace Controls"
        description={`${weightsHint} Workflow: Draft → Generated → Verified → Published → Locked.`}
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
          </div>
        </div>
      </Panel>

      {scopeHint ? (
        <EmptyState
          icon={BarChart3}
          title="Select filters to continue"
          description={scopeHint}
        />
      ) : viewMode === "analytics" ? (
        <ResultSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          stats={statsQuery.data}
          loading={statsLoading}
        />
      ) : viewMode === "broadsheet" ? (
        <ResultBroadsheet
          broadsheet={broadsheetQuery.data}
          loading={broadsheetLoading}
          onExportError={toastError}
          onViewStudent={handleViewStudent}
        />
      ) : viewMode === "merit" ? (
        <ResultMeritList
          meritList={meritQuery.data}
          loading={meritLoading}
          onExportError={toastError}
          onViewStudent={handleViewStudent}
        />
      ) : listError ? (
        <EmptyState
          icon={BarChart3}
          title="Results unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() => listQuery.refetch()}
        />
      ) : (
        <ResultList
          title={
            viewMode === "archived" ? "Archived Results" : "Results Directory"
          }
          description={
            viewMode === "archived"
              ? "Soft-archived results that can be restored."
              : "Composite CA + examination results with grade, positions, and workflow state."
          }
          rows={rows}
          loading={listLoading}
          page={page}
          pageSize={pageSize}
          total={listQuery.data?.pagination?.total ?? rows.length}
          search={search}
          passFilter={passFilter}
          workflowFilter={workflowFilter}
          sortKey={sortKey}
          sortDirection={sortDirection}
          archivedView={viewMode === "archived"}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSearchChange={setSearch}
          onPassFilterChange={setPassFilter}
          onWorkflowFilterChange={setWorkflowFilter}
          onSortChange={({ key, direction }) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          onView={handleView}
          onViewStudent={handleViewStudent}
          onArchive={(row) => {
            setArchiveError("");
            setArchiveTarget(row);
          }}
          onRestore={handleRestore}
          onToggleVerify={handleToggleVerify}
          onTogglePublish={handleTogglePublish}
          onToggleLock={handleToggleLock}
          onGenerate={canGenerate ? openGenerate : undefined}
          canGenerate={canGenerate}
          canVerify={canVerify}
          canPublish={canPublish}
          canLock={canLock || isAdmin}
          canArchive={canArchive}
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          emptyActionLabel={canGenerate ? "Generate Results" : undefined}
          onEmptyAction={
            viewMode === "archived" || !canGenerate ? undefined : openGenerate
          }
        />
      )}

      <ResultProfile
        open={profileOpen}
        resultId={profileResultId}
        onClose={() => {
          setProfileOpen(false);
          setProfileResultId(null);
        }}
        onToggleVerify={canVerify ? handleToggleVerify : undefined}
        onTogglePublish={canPublish ? handleTogglePublish : undefined}
        onToggleLock={canLock || isAdmin ? handleToggleLock : undefined}
        onArchive={
          canArchive
            ? (detail) => {
                setProfileOpen(false);
                setArchiveError("");
                setArchiveTarget(mapResultToRow(detail));
              }
            : undefined
        }
      />

      <StudentResultProfile
        open={studentProfileOpen}
        studentId={studentProfileId}
        filters={{
          academicYearId: academicYearId ? Number(academicYearId) : undefined,
          termId: termId ? Number(termId) : undefined,
          classId: classId ? Number(classId) : undefined,
        }}
        onClose={() => {
          setStudentProfileOpen(false);
          setStudentProfileId(null);
        }}
        onViewSubject={(row) => {
          setStudentProfileOpen(false);
          handleView(row);
        }}
      />

      <ResultGenerateForm
        open={generateOpen}
        defaults={{
          academicYearId,
          termId,
          classId,
          subjectId,
        }}
        onClose={() => setGenerateOpen(false)}
        onSuccess={(message) => {
          toastSuccess(message);
          refreshResults();
        }}
      />

      <ResultDeleteDialog
        open={Boolean(archiveTarget)}
        result={archiveTarget}
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
