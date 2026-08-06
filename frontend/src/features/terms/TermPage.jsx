import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, CalendarRange } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  activateTerm,
  deleteTerm,
  getArchivedTerms,
  getTermById,
  getTerms,
  restoreTerm,
} from "../../services/terms/term.service";
import ArchivedTerms from "./ArchivedTerms";
import TermDeleteDialog from "./TermDeleteDialog";
import TermForm from "./TermForm";
import TermList from "./TermList";
import TermProfile from "./TermProfile";
import TermStats from "./TermStats";
import {
  exportTermsToExcel,
  exportTermsToPdf,
  printTerms,
} from "./term.export";
import { getApiErrorMessage, mapTermToRow } from "./term.mappers";

const SEARCH_DEBOUNCE_MS = 400;
const EXPORT_PAGE_LIMIT = 100;

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

/**
 * Terms module workspace — list, archive, form, details.
 */
export default function TermPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTermId, setProfileTermId] = useState(null);

  // Atomic drawer state — open/record always update together so edit
  // cannot mount as create.
  const [drawer, setDrawer] = useState({
    open: false,
    record: null,
  });

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
    () => `${debouncedSearch}|${viewMode}|${status}|${pageSize}`
  );
  const nextFilterKey = `${debouncedSearch}|${viewMode}|${status}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const termsQuery = useQuery({
    queryKey: ["terms", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getTerms({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
      });
      return {
        data: response?.data ?? [],
        pagination: response?.pagination ?? {
          page: 1,
          limit: pageSize,
          total: 0,
          totalPages: 0,
        },
      };
    },
    enabled: viewMode === "active",
    placeholderData: keepPreviousData,
  });

  const archivedQuery = useQuery({
    queryKey: ["terms", "archived"],
    queryFn: async () => {
      const response = await getArchivedTerms();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["terms", "stats-active"],
    queryFn: async () => {
      const response = await getTerms({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshTerms = () => {
    queryClient.invalidateQueries({ queryKey: ["terms"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (termsQuery.data?.data ?? []).map(mapTermToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [termsQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapTermToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(needle) ||
          row.code.toLowerCase().includes(needle) ||
          row.academicYearName.toLowerCase().includes(needle)
      );
    }
    return sortRows(rows, sortKey, sortDirection);
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const archivedTotal = archivedMapped.length;
  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsTerms = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapTermToRow);
    const archived = (archivedQuery.data ?? []).map(mapTermToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? termsQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : termsQuery.isLoading && !termsQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived terms."
          )
        : ""
      : termsQuery.isError
        ? getApiErrorMessage(
            termsQuery.error,
            "Unable to load terms. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setDrawer({ open: true, record: null });
  };

  const openEditForm = async (termLike) => {
    const id = termLike?.id;
    if (id == null || id === "") return;

    setProfileOpen(false);

    let record = termLike;
    try {
      const response = await getTermById(id);
      if (response?.data?.id != null) {
        record = response.data;
      }
    } catch {
      // Fall back to the row/detail already in hand.
    }

    if (record?.id == null || record.id === "") return;

    setDrawer({ open: true, record });
  };

  const closeForm = () => {
    setDrawer({ open: false, record: null });
  };

  const handleView = (row) => {
    setProfileTermId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_term, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Term updated successfully."
          : "Term created successfully.")
    );
    refreshTerms();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteTerm(deleteTarget.id);
      toastSuccess(response?.message || "Term archived successfully.");
      setDeleteTarget(null);
      refreshTerms();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, "Unable to archive term. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreTerm(row.id);
      toastSuccess(response?.message || "Term restored successfully.");
      refreshTerms();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to restore term. Please try again.")
      );
    }
  };

  const handleActivate = async (row) => {
    try {
      const response = await activateTerm(row.id);
      toastSuccess(response?.message || "Term activated successfully.");
      refreshTerms();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to activate term. Please try again.")
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getTerms({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapTermToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No terms to export.");
        return;
      }
      exportTermsToExcel(
        rows,
        viewMode === "archived" ? "archived-terms.xlsx" : "terms.xlsx"
      );
      toastSuccess("Excel export ready.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "Excel export failed."));
    }
  };

  const handleExportPdf = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No terms to export.");
        return;
      }
      exportTermsToPdf(
        rows,
        viewMode === "archived" ? "archived-terms.pdf" : "terms.pdf"
      );
      toastSuccess("PDF export ready.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "PDF export failed."));
    }
  };

  const handlePrint = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No terms to print.");
        return;
      }
      printTerms(rows);
    } catch (error) {
      toastError(getApiErrorMessage(error, "Print failed."));
    }
  };

  const handleSortChange = ({ key, direction }) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const listProps = {
    rows: listRows,
    loading: listLoading,
    page,
    pageSize,
    total: listTotal,
    search,
    status,
    sortKey,
    sortDirection,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearchChange: setSearch,
    onStatusChange: setStatus,
    onSortChange: handleSortChange,
    onView: handleView,
    onEdit: (row) => openEditForm(row),
    onDelete: (row) => {
      setDeleteError("");
      setDeleteTarget(row);
    },
    onRestore: handleRestore,
    onActivate: handleActivate,
    onAdd: openCreateForm,
    onExportExcel: handleExportExcel,
    onExportPdf: handleExportPdf,
    onPrint: handlePrint,
    emptyActionLabel: viewMode === "active" ? "Add Term" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Term Management"
        description="Define terms under academic years, control the single Active term, and keep term dates non-overlapping."
        titleId="terms-page-heading"
      />

      <TermStats
        terms={statsTerms}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived terms."
      >
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            variant={viewMode === "active" ? "primary" : "secondary"}
            size="sm"
            className="w-auto"
            onClick={() => setViewMode("active")}
            disabled={listLoading}
          >
            <CalendarRange size={16} aria-hidden />
            Active
          </Button>
          <Button
            type="button"
            variant={viewMode === "archived" ? "primary" : "secondary"}
            size="sm"
            className="w-auto"
            onClick={() => setViewMode("archived")}
            disabled={listLoading}
          >
            <Archive size={16} aria-hidden />
            Archived
          </Button>
        </div>
      </Panel>

      {listError ? (
        <EmptyState
          icon={CalendarRange}
          title="Terms unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : termsQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedTerms {...listProps} />
      ) : (
        <TermList {...listProps} />
      )}

      <TermProfile
        open={profileOpen}
        termId={profileTermId}
        onClose={() => {
          setProfileOpen(false);
          setProfileTermId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <TermForm
        open={drawer.open}
        term={drawer.record}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
      />

      <TermDeleteDialog
        open={Boolean(deleteTarget)}
        term={deleteTarget}
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
