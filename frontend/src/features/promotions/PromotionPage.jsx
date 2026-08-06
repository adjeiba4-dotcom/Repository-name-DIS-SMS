import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  LayoutList,
  Play,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import {
  approvePromotions,
  archivePromotion,
  cancelPromotions,
  executePromotions,
  getArchivedPromotions,
  getGraduates,
  getPromotionStats,
  getPromotions,
  recommendPromotions,
  restorePromotion,
  unapprovePromotions,
  updatePromotion,
} from "../../services/promotions/promotion.service";
import { getTerms } from "../../services/terms/term.service";
import PromotionDeleteDialog from "./PromotionDeleteDialog";
import PromotionDetails from "./PromotionDetails";
import PromotionExecuteDialog from "./PromotionExecuteDialog";
import PromotionForm from "./PromotionForm";
import PromotionList from "./PromotionList";
import PromotionRecommendForm from "./PromotionRecommendForm";
import PromotionStats from "./PromotionStats";
import PromotionSummaries from "./PromotionSummaries";
import {
  exportPromotionsToCsv,
  exportPromotionsToExcel,
  exportPromotionsToPdf,
  printPromotions,
} from "./promotion.export";
import {
  formatClassLabel,
  getApiErrorMessage,
  mapPromotionToRow,
} from "./promotion.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "directory", label: "Directory", icon: LayoutList },
  { id: "graduates", label: "Graduates", icon: GraduationCap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "archived", label: "Archived", icon: Archive },
];

const WRITE_ROLES = new Set([
  "Administrator",
  "Headmaster",
  "Registrar",
  "Teacher",
]);
const APPROVE_ROLES = new Set(["Administrator", "Headmaster", "Registrar"]);

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
 * Student Promotion & Graduation workspace — recommend, approve, execute.
 */
export default function PromotionPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const roleName = user?.role?.name || "";
  const canWrite = WRITE_ROLES.has(roleName);
  const canApprove = APPROVE_ROLES.has(roleName);
  const canExecute = APPROVE_ROLES.has(roleName);
  const isAdmin = roleName === "Administrator";

  const [viewMode, setViewMode] = useState("directory");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [summaryScope, setSummaryScope] = useState("overview");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [sortKey, setSortKey] = useState("studentName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedIds, setSelectedIds] = useState([]);

  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const [executeIds, setExecuteIds] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executeError, setExecuteError] = useState("");

  const [toYearId, setToYearId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const [filterKey, setFilterKey] = useState(
    () =>
      `${viewMode}|${academicYearId}|${termId}|${classId}|${debouncedSearch}|${workflowFilter}|${decisionFilter}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${debouncedSearch}|${workflowFilter}|${decisionFilter}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
    setSelectedIds([]);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "promotion-workspace"],
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
    queryKey: ["terms", "promotion-workspace", academicYearId],
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
    queryKey: ["classes", "promotion-workspace", academicYearId],
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

  const toClassesQuery = useQuery({
    queryKey: ["classes", "promotion-destination", toYearId],
    queryFn: async () => {
      const response = await getClasses({
        page: 1,
        limit: 100,
        academicYearId: toYearId || undefined,
      });
      return response?.data ?? [];
    },
    enabled: Boolean(toYearId),
  });

  const listParams = {
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    academicYearId: academicYearId || undefined,
    termId: termId || undefined,
    classId: classId || undefined,
    workflowStatus: workflowFilter !== "all" ? workflowFilter : undefined,
    decision: decisionFilter !== "all" ? decisionFilter : undefined,
  };

  const listQuery = useQuery({
    queryKey: ["student-promotions", viewMode, listParams],
    queryFn: async () => {
      if (viewMode === "archived") {
        return getArchivedPromotions(listParams);
      }
      if (viewMode === "graduates") {
        return getGraduates({
          ...listParams,
          decision: "GRADUATED",
        });
      }
      return getPromotions(listParams);
    },
    placeholderData: keepPreviousData,
    enabled: viewMode !== "analytics",
  });

  const statsQuery = useQuery({
    queryKey: [
      "student-promotions-stats",
      academicYearId,
      termId,
      classId,
      summaryScope,
    ],
    queryFn: async () => {
      const response = await getPromotionStats({
        academicYearId: academicYearId || undefined,
        termId: termId || undefined,
        classId: classId || undefined,
        scope: summaryScope,
      });
      return response?.data ?? null;
    },
    enabled: Boolean(academicYearId),
  });

  const rows = useMemo(() => {
    const data = listQuery.data?.data ?? [];
    const mapped = data.map(mapPromotionToRow);
    return sortRows(mapped, sortKey, sortDirection);
  }, [listQuery.data, sortKey, sortDirection]);

  const total =
    listQuery.data?.pagination?.total ?? rows.length;

  async function invalidateAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["student-promotions"] }),
      queryClient.invalidateQueries({ queryKey: ["student-promotions-stats"] }),
    ]);
  }

  async function handleRecommend(payload) {
    setRecommendLoading(true);
    try {
      const response = await recommendPromotions(payload);
      const summary = response?.data?.summary;
      toastSuccess(
        summary
          ? `Recommended ${summary.created} · updated ${summary.updated} · skipped ${summary.skipped}`
          : "Recommendations generated."
      );
      setRecommendOpen(false);
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to recommend promotions."));
    } finally {
      setRecommendLoading(false);
    }
  }

  async function handleUpdate(payload) {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await updatePromotion(editTarget.id, payload);
      toastSuccess("Promotion updated.");
      setEditTarget(null);
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to update promotion."));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleApprove(ids) {
    try {
      const response = await approvePromotions({ ids });
      const summary = response?.data?.summary;
      toastSuccess(
        summary
          ? `Approved ${summary.approved} · skipped ${summary.skipped}`
          : "Promotions approved."
      );
      setSelectedIds([]);
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to approve promotions."));
    }
  }

  async function handleUnapprove(ids) {
    try {
      const response = await unapprovePromotions({ ids });
      const summary = response?.data?.summary;
      toastSuccess(
        summary
          ? `Reverted ${summary.reverted} · skipped ${summary.skipped}`
          : "Approvals reversed."
      );
      setSelectedIds([]);
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to unapprove promotions."));
    }
  }

  async function handleCancel(ids) {
    try {
      const response = await cancelPromotions({ ids });
      const summary = response?.data?.summary;
      toastSuccess(
        summary
          ? `Cancelled ${summary.cancelled} · skipped ${summary.skipped}`
          : "Promotions cancelled."
      );
      setSelectedIds([]);
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to cancel promotions."));
    }
  }

  async function handleExecuteConfirm() {
    setExecuting(true);
    setExecuteError("");
    try {
      const response = await executePromotions({ ids: executeIds });
      const summary = response?.data?.summary;
      toastSuccess(
        summary
          ? `Executed ${summary.executed} · skipped ${summary.skipped} · errors ${summary.errors}`
          : "Promotions executed."
      );
      setExecuteIds([]);
      setSelectedIds([]);
      await invalidateAll();
    } catch (error) {
      setExecuteError(getApiErrorMessage(error, "Failed to execute promotions."));
    } finally {
      setExecuting(false);
    }
  }

  async function handleArchiveConfirm() {
    if (!archiveTarget) return;
    setArchiving(true);
    setArchiveError("");
    try {
      await archivePromotion(archiveTarget.id);
      toastSuccess("Promotion archived.");
      setArchiveTarget(null);
      await invalidateAll();
    } catch (error) {
      setArchiveError(getApiErrorMessage(error, "Failed to archive."));
    } finally {
      setArchiving(false);
    }
  }

  async function handleRestore(row) {
    try {
      await restorePromotion(row.id);
      toastSuccess("Promotion restored.");
      await invalidateAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Failed to restore promotion."));
    }
  }

  const classOptions = [
    { value: "", label: "All classes" },
    ...(classesQuery.data || []).map((item) => ({
      value: String(item.id),
      label: formatClassLabel(item),
    })),
  ];

  return (
    <div className="space-y-[var(--space-5)]">
      <SectionHeader
        eyebrow="Academic Operations"
        title="Student Promotion & Graduation"
        description="Recommend from published report cards, preview drafts, approve, then promote or graduate."
        titleId="promotions-page-heading"
        actions={
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-auto"
              onClick={() => invalidateAll()}
            >
              <RefreshCw size={16} aria-hidden />
              Refresh
            </Button>
            {canWrite ? (
              <Button
                type="button"
                size="sm"
                className="w-auto"
                onClick={() => setRecommendOpen(true)}
              >
                <Sparkles size={16} aria-hidden />
                Recommend
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {VIEW_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = viewMode === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant={active ? "primary" : "ghost"}
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

      <Panel className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SelectField
          label="Academic year"
          value={academicYearId}
          onChange={(event) => setAcademicYearId(event.target.value)}
          options={[
            { value: "", label: "Select academic year" },
            ...(yearsQuery.data || []).map((year) => ({
              value: String(year.id),
              label: year.name,
            })),
          ]}
        />
        <SelectField
          label="Term"
          value={termId}
          onChange={(event) => setTermId(event.target.value)}
          options={[
            { value: "", label: "All terms" },
            ...(termsQuery.data || []).map((term) => ({
              value: String(term.id),
              label: term.name,
            })),
          ]}
        />
        <SelectField
          label="Class"
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
          options={classOptions}
        />
      </Panel>

      {viewMode !== "analytics" ? (
        <PromotionStats
          rows={rows}
          overview={statsQuery.data?.overview}
          loading={listQuery.isLoading || statsQuery.isLoading}
        />
      ) : null}

      {viewMode === "analytics" ? (
        <PromotionSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          overview={statsQuery.data?.overview}
          byClass={statsQuery.data?.byClass || []}
          loading={statsQuery.isLoading}
        />
      ) : rows.length || listQuery.isLoading ? (
        <>
          {selectedIds.length > 0 && viewMode === "directory" ? (
            <div className="flex flex-wrap gap-2">
              {canApprove ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-auto"
                  onClick={() => handleApprove(selectedIds)}
                >
                  <CheckCircle2 size={16} aria-hidden />
                  Approve selected
                </Button>
              ) : null}
              {canExecute ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-auto"
                  onClick={() => {
                    setExecuteError("");
                    setExecuteIds(selectedIds);
                  }}
                >
                  <Play size={16} aria-hidden />
                  Execute selected
                </Button>
              ) : null}
              {canWrite ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-auto"
                  onClick={() => handleCancel(selectedIds)}
                >
                  <XCircle size={16} aria-hidden />
                  Cancel selected
                </Button>
              ) : null}
              {isAdmin ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-auto"
                  onClick={() => handleUnapprove(selectedIds)}
                >
                  Unapprove selected
                </Button>
              ) : null}
            </div>
          ) : null}

          <PromotionList
            rows={rows}
            loading={listQuery.isLoading}
            page={page}
            pageSize={pageSize}
            total={total}
            search={search}
            sortKey={sortKey}
            sortDirection={sortDirection}
            workflowFilter={workflowFilter}
            decisionFilter={decisionFilter}
            selectedIds={selectedIds}
            canWrite={canWrite}
            canApprove={canApprove}
            canExecute={canExecute}
            archivedView={viewMode === "archived"}
            onSearchChange={setSearch}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={({ key, direction }) => {
              setSortKey(key);
              setSortDirection(direction);
            }}
            onWorkflowFilterChange={setWorkflowFilter}
            onDecisionFilterChange={setDecisionFilter}
            onSelectionChange={setSelectedIds}
            onView={setDetailTarget}
            onEdit={setEditTarget}
            onApprove={handleApprove}
            onExecute={(ids) => {
              setExecuteError("");
              setExecuteIds(ids);
            }}
            onCancel={handleCancel}
            onArchive={setArchiveTarget}
            onRestore={handleRestore}
            onExportExcel={() => exportPromotionsToExcel(rows)}
            onExportCsv={() => exportPromotionsToCsv(rows)}
            onExportPdf={() => exportPromotionsToPdf(rows)}
            onPrint={() => printPromotions(rows)}
          />
        </>
      ) : (
        <EmptyState
          title="No promotions yet"
          description="Use Recommend to generate draft decisions from published report cards."
          actionLabel={canWrite ? "Recommend Promotions" : undefined}
          onAction={canWrite ? () => setRecommendOpen(true) : undefined}
        />
      )}

      <PromotionRecommendForm
        open={recommendOpen}
        years={yearsQuery.data || []}
        terms={termsQuery.data || []}
        classes={classesQuery.data || []}
        toYears={yearsQuery.data || []}
        toClasses={toClassesQuery.data || []}
        loading={recommendLoading}
        initialValues={{
          academicYearId,
          termId,
          classId,
        }}
        onClose={() => setRecommendOpen(false)}
        onSubmit={handleRecommend}
        onAcademicYearChange={(value) => {
          if (value) setAcademicYearId(value);
        }}
        onToAcademicYearChange={setToYearId}
      />

      <PromotionForm
        open={Boolean(editTarget)}
        promotion={editTarget}
        years={yearsQuery.data || []}
        classes={
          toYearId || editTarget?.toAcademicYearId
            ? toClassesQuery.data || classesQuery.data || []
            : classesQuery.data || []
        }
        loading={editLoading}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        onToAcademicYearChange={setToYearId}
      />

      <PromotionDetails
        open={Boolean(detailTarget)}
        promotion={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <PromotionDeleteDialog
        open={Boolean(archiveTarget)}
        promotion={archiveTarget}
        loading={archiving}
        error={archiveError}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
      />

      <PromotionExecuteDialog
        open={executeIds.length > 0}
        count={executeIds.length}
        loading={executing}
        error={executeError}
        onCancel={() => setExecuteIds([])}
        onConfirm={handleExecuteConfirm}
      />
    </div>
  );
}
