import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  FileText,
  LayoutList,
  Lock,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import { SelectField } from "../../components/form";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";
import { getAcademicYears } from "../../services/academic-years/academicYear.service";
import { getClasses } from "../../services/classes/class.service";
import {
  archiveReportCard,
  getArchivedReportCards,
  getReportCardPreview,
  getReportCards,
  getReportCardStats,
  lockReportCards,
  publishReportCards,
  restoreReportCard,
  unlockReportCards,
  unpublishReportCards,
  unverifyReportCards,
  verifyReportCards,
} from "../../services/report-cards/reportCard.service";
import { getTerms } from "../../services/terms/term.service";
import ReportCardDeleteDialog from "./ReportCardDeleteDialog";
import ReportCardForm from "./ReportCardForm";
import ReportCardGenerateForm from "./ReportCardGenerateForm";
import ReportCardList from "./ReportCardList";
import ReportCardPreview from "./ReportCardPreview";
import ReportCardStats from "./ReportCardStats";
import ReportCardSummaries from "./ReportCardSummaries";
import {
  exportReportCardA4Pdf,
  exportReportCardsToCsv,
  exportReportCardsToExcel,
  exportReportCardsToPdf,
  printReportCardA4,
  printReportCards,
} from "./reportCard.export";
import {
  formatClassLabel,
  getApiErrorMessage,
  mapReportCardToRow,
} from "./reportCard.mappers";

const SEARCH_DEBOUNCE_MS = 400;

const VIEW_OPTIONS = [
  { id: "directory", label: "Directory", icon: LayoutList },
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
 * Report Cards workspace — generate, verify, publish/lock, preview, PDF/print, analytics.
 */
export default function ReportCardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const roleName = user?.role?.name || "";
  const canGenerate = WRITE_ROLES.has(roleName);
  const canVerify = VERIFY_ROLES.has(roleName);
  const canPublish = WRITE_ROLES.has(roleName);
  const canLock = WRITE_ROLES.has(roleName);
  const canWrite = WRITE_ROLES.has(roleName);
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
  const [sortKey, setSortKey] = useState("averageScoreLabel");
  const [sortDirection, setSortDirection] = useState("desc");

  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState("single");
  const [editTarget, setEditTarget] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      `${viewMode}|${academicYearId}|${termId}|${classId}|${debouncedSearch}|${workflowFilter}|${pageSize}|${summaryScope}`
  );
  const nextFilterKey = `${viewMode}|${academicYearId}|${termId}|${classId}|${debouncedSearch}|${workflowFilter}|${pageSize}|${summaryScope}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const yearsQuery = useQuery({
    queryKey: ["academic-years", "report-card-workspace"],
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
    queryKey: ["terms", "report-card-workspace", academicYearId],
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
    queryKey: ["classes", "report-card-workspace", academicYearId],
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

  const listParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      academicYearId: academicYearId || undefined,
      termId: termId || undefined,
      classId: classId || undefined,
      workflowStatus: workflowFilter !== "all" ? workflowFilter : undefined,
    }),
    [
      page,
      pageSize,
      debouncedSearch,
      academicYearId,
      termId,
      classId,
      workflowFilter,
    ]
  );

  const directoryQuery = useQuery({
    queryKey: ["report-cards", "directory", listParams],
    queryFn: async () => {
      const response = await getReportCards(listParams);
      return response;
    },
    enabled: viewMode === "directory" && Boolean(academicYearId && termId),
    placeholderData: keepPreviousData,
  });

  const archivedQuery = useQuery({
    queryKey: ["report-cards", "archived", listParams],
    queryFn: async () => {
      const response = await getArchivedReportCards(listParams);
      return response;
    },
    enabled: viewMode === "archived",
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: [
      "report-cards",
      "stats",
      academicYearId,
      termId,
      classId,
      summaryScope,
    ],
    queryFn: async () => {
      const response = await getReportCardStats({
        scope: summaryScope,
        academicYearId: academicYearId || undefined,
        termId: termId || undefined,
        classId: classId || undefined,
      });
      return response?.data ?? null;
    },
    enabled: Boolean(academicYearId && termId),
  });

  const previewQuery = useQuery({
    queryKey: ["report-cards", "preview", previewId],
    queryFn: async () => {
      const response = await getReportCardPreview(previewId);
      return response?.data ?? null;
    },
    enabled: Boolean(previewOpen && previewId),
  });

  const activeQuery =
    viewMode === "archived" ? archivedQuery : directoryQuery;
  const rawRows = activeQuery.data?.data ?? [];
  const mappedRows = useMemo(
    () => sortRows(rawRows.map(mapReportCardToRow), sortKey, sortDirection),
    [rawRows, sortKey, sortDirection]
  );
  const total =
    activeQuery.data?.pagination?.total ?? mappedRows.length;

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["report-cards"] });
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
    classId: classId ? Number(classId) : undefined,
  });

  const handleVerify = async (row) => {
    try {
      if (row.isVerified && !row.isPublished && !row.isLocked) {
        await unverifyReportCards({ ids: [row.id] });
        toastSuccess("Report card unverified.");
      } else {
        await verifyReportCards({ ids: [row.id] });
        toastSuccess("Report card verified.");
      }
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update verification."));
    }
  };

  const handlePublish = async (row) => {
    try {
      if (row.isPublished) {
        await unpublishReportCards({ ids: [row.id] });
        toastSuccess("Report card unpublished.");
      } else {
        await publishReportCards({ ids: [row.id] });
        toastSuccess("Report card published.");
      }
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update publication."));
    }
  };

  const handleLock = async (row) => {
    try {
      if (row.isLocked) {
        await unlockReportCards({ ids: [row.id] });
        toastSuccess("Report card unlocked.");
      } else {
        await lockReportCards({ ids: [row.id] });
        toastSuccess("Report card locked.");
      }
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to update lock state."));
    }
  };

  const handleBulkVerify = async () => {
    if (!requireClassScope("verify by scope")) return;
    try {
      await verifyReportCards(scopePayload());
      toastSuccess("Report cards verified for the selected scope.");
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to verify report cards."));
    }
  };

  const handleBulkPublish = async () => {
    if (!requireClassScope("publish by scope")) return;
    try {
      await publishReportCards(scopePayload());
      toastSuccess("Report cards published for the selected scope.");
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to publish report cards."));
    }
  };

  const handleBulkLock = async () => {
    if (!requireClassScope("lock by scope")) return;
    try {
      await lockReportCards(scopePayload());
      toastSuccess("Report cards locked for the selected scope.");
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to lock report cards."));
    }
  };

  const openPreview = (row) => {
    setPreviewId(row.id);
    setPreviewOpen(true);
  };

  const loadPreviewForRow = async (row) => {
    const cached = queryClient.getQueryData([
      "report-cards",
      "preview",
      row.id,
    ]);
    if (cached) return cached;
    const response = await getReportCardPreview(row.id);
    const data = response?.data ?? null;
    queryClient.setQueryData(["report-cards", "preview", row.id], data);
    return data;
  };

  const handleDownloadPdf = async (row) => {
    try {
      const preview = await loadPreviewForRow(row);
      await exportReportCardA4Pdf(
        preview,
        `report-card-${row.admissionNo || row.id}.pdf`
      );
      toastSuccess("PDF downloaded.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to generate PDF."));
    }
  };

  const handlePrintCard = async (row) => {
    try {
      const preview = await loadPreviewForRow(row);
      printReportCardA4(preview);
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to print report card."));
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    setArchiveError("");
    try {
      await archiveReportCard(archiveTarget.id);
      toastSuccess("Report card archived.");
      setArchiveTarget(null);
      refreshAll();
    } catch (error) {
      setArchiveError(
        getApiErrorMessage(error, "Unable to archive report card.")
      );
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await restoreReportCard(row.id);
      toastSuccess("Report card restored.");
      refreshAll();
    } catch (error) {
      toastError(getApiErrorMessage(error, "Unable to restore report card."));
    }
  };

  const scopeHint =
    !academicYearId || !termId
      ? "Select an academic year and term to continue."
      : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Report Cards"
        description="Generate official academic snapshots from published results, then verify, publish, lock, preview, and print professional A4 report cards."
        titleId="report-cards-page-heading"
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
                <ShieldCheck size={16} aria-hidden />
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
                <Megaphone size={16} aria-hidden />
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
                <Lock size={16} aria-hidden />
                Lock Scope
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-auto"
              onClick={refreshAll}
            >
              <RefreshCw size={16} aria-hidden />
              Refresh
            </Button>
            {canGenerate ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-auto"
                  onClick={() => {
                    setGenerateMode("bulk");
                    setGenerateOpen(true);
                  }}
                >
                  <Users size={16} aria-hidden />
                  Bulk Class
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-auto"
                  onClick={() => {
                    setGenerateMode("single");
                    setGenerateOpen(true);
                  }}
                >
                  <Sparkles size={16} aria-hidden />
                  Generate
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      <ReportCardStats
        rows={mappedRows}
        overview={statsQuery.data?.overview}
        loading={statsQuery.isLoading}
      />

      <Panel>
        <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Academic Year"
              value={academicYearId}
              onChange={(event) => setAcademicYearId(event.target.value)}
              options={(yearsQuery.data || []).map((year) => ({
                value: String(year.id),
                label: year.name,
              }))}
              placeholder="Select year"
            />
            <SelectField
              label="Term"
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              options={(termsQuery.data || []).map((term) => ({
                value: String(term.id),
                label: term.name,
              }))}
              placeholder="Select term"
              disabled={!academicYearId}
            />
            <SelectField
              label="Class"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              options={[
                { value: "", label: "All classes" },
                ...(classesQuery.data || []).map((item) => ({
                  value: String(item.id),
                  label: formatClassLabel(item),
                })),
              ]}
              placeholder="All classes"
              disabled={!academicYearId}
            />
          </div>

          <div className="flex flex-wrap gap-[var(--space-2)]">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = viewMode === option.id;
              return (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  className="w-auto"
                  variant={active ? "primary" : "outline"}
                  onClick={() => setViewMode(option.id)}
                >
                  <Icon size={16} aria-hidden />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Panel>

      {scopeHint ? (
        <EmptyState
          icon={FileText}
          title="Select academic filters"
          description={scopeHint}
        />
      ) : null}

      {!scopeHint && viewMode === "analytics" ? (
        <ReportCardSummaries
          scope={summaryScope}
          onScopeChange={setSummaryScope}
          stats={statsQuery.data}
          loading={statsQuery.isLoading}
        />
      ) : null}

      {!scopeHint && viewMode !== "analytics" ? (
        <ReportCardList
          archivedView={viewMode === "archived"}
          rows={mappedRows}
          loading={activeQuery.isLoading || activeQuery.isFetching}
          page={page}
          pageSize={pageSize}
          total={total}
          search={search}
          workflowFilter={workflowFilter}
          sortKey={sortKey}
          sortDirection={sortDirection}
          canWrite={canWrite}
          canVerify={canVerify}
          canPublish={canPublish}
          canLock={canLock}
          canGenerate={canGenerate}
          isAdmin={isAdmin}
          onSearchChange={setSearch}
          onWorkflowFilterChange={setWorkflowFilter}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onSortChange={({ key, direction }) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          onPreview={openPreview}
          onEdit={setEditTarget}
          onVerify={handleVerify}
          onPublish={handlePublish}
          onLock={handleLock}
          onArchive={setArchiveTarget}
          onRestore={handleRestore}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrintCard}
          onExportExcel={() =>
            exportReportCardsToExcel(mappedRows, "report-cards.xlsx")
          }
          onExportCsv={() =>
            exportReportCardsToCsv(mappedRows, "report-cards.csv")
          }
          onExportPdf={() =>
            exportReportCardsToPdf(mappedRows, "report-cards.pdf")
          }
          onPrintList={() => printReportCards(mappedRows)}
          onGenerate={() => {
            setGenerateMode("single");
            setGenerateOpen(true);
          }}
          onGenerateBulk={() => {
            setGenerateMode("bulk");
            setGenerateOpen(true);
          }}
        />
      ) : null}

      <ReportCardGenerateForm
        open={generateOpen}
        mode={generateMode}
        defaults={{
          academicYearId,
          termId,
          classId,
        }}
        onClose={() => setGenerateOpen(false)}
        onSuccess={(result) => {
          const meta = result?.data?.meta;
          if (meta) {
            toastSuccess(
              `Bulk complete — created ${meta.created}, updated ${meta.updated}, skipped ${meta.skipped}, failed ${meta.failed}.`
            );
          } else {
            toastSuccess("Report card generated successfully.");
          }
          refreshAll();
        }}
      />

      <ReportCardForm
        open={Boolean(editTarget)}
        reportCard={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          toastSuccess("Report card updated.");
          refreshAll();
        }}
      />

      <ReportCardPreview
        open={previewOpen}
        preview={previewQuery.data}
        loading={previewQuery.isLoading}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewId(null);
        }}
        onDownloadPdf={async () => {
          if (!previewQuery.data) return;
          await exportReportCardA4Pdf(
            previewQuery.data,
            `report-card-${previewId}.pdf`
          );
        }}
        onPrint={() => {
          if (!previewQuery.data) return;
          printReportCardA4(previewQuery.data);
        }}
      />

      <ReportCardDeleteDialog
        open={Boolean(archiveTarget)}
        reportCard={archiveTarget}
        loading={archiving}
        error={archiveError}
        onCancel={() => {
          setArchiveTarget(null);
          setArchiveError("");
        }}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  );
}
