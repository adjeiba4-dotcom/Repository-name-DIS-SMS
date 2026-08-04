import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, CalendarDays } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteAcademicYear,
  getAcademicYearById,
  getAcademicYears,
  getArchivedAcademicYears,
  restoreAcademicYear,
} from "../../services/academic-years/academicYear.service";
import AcademicYearDeleteDialog from "./AcademicYearDeleteDialog";
import AcademicYearForm from "./AcademicYearForm";
import AcademicYearList from "./AcademicYearList";
import AcademicYearProfile from "./AcademicYearProfile";
import AcademicYearStats from "./AcademicYearStats";
import ArchivedAcademicYears from "./ArchivedAcademicYears";
import {
  exportAcademicYearsToExcel,
  exportAcademicYearsToPdf,
  printAcademicYears,
} from "./academicYear.export";
import {
  getApiErrorMessage,
  mapAcademicYearToRow,
} from "./academicYear.mappers";

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
 * Academic Years module workspace — list, archive, form, details.
 */
export default function AcademicYearPage() {
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
  const [profileAcademicYearId, setProfileAcademicYearId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);

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

  const yearsQuery = useQuery({
    queryKey: ["academic-years", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getAcademicYears({
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
    queryKey: ["academic-years", "archived"],
    queryFn: async () => {
      const response = await getArchivedAcademicYears();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["academic-years", "stats-active"],
    queryFn: async () => {
      const response = await getAcademicYears({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshYears = () => {
    queryClient.invalidateQueries({ queryKey: ["academic-years"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (yearsQuery.data?.data ?? []).map(mapAcademicYearToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [yearsQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapAcademicYearToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter((row) => row.name.toLowerCase().includes(needle));
    }
    return sortRows(rows, sortKey, sortDirection);
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const archivedTotal = archivedMapped.length;
  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsYears = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapAcademicYearToRow);
    const archived = (archivedQuery.data ?? []).map(mapAcademicYearToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? yearsQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : yearsQuery.isLoading && !yearsQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived academic years."
          )
        : ""
      : yearsQuery.isError
        ? getApiErrorMessage(
            yearsQuery.error,
            "Unable to load academic years. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingAcademicYear(null);
    setFormOpen(true);
  };

  const openEditForm = async (yearLike) => {
    const id = yearLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getAcademicYearById(id);
      setEditingAcademicYear(response?.data ?? yearLike);
    } catch {
      setEditingAcademicYear(yearLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileAcademicYearId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_year, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Academic year updated successfully."
          : "Academic year created successfully.")
    );
    refreshYears();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteAcademicYear(deleteTarget.id);
      toastSuccess(response?.message || "Academic year archived successfully.");
      setDeleteTarget(null);
      refreshYears();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive academic year. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreAcademicYear(row.id);
      toastSuccess(response?.message || "Academic year restored successfully.");
      refreshYears();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore academic year. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getAcademicYears({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapAcademicYearToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No academic years to export.");
        return;
      }
      exportAcademicYearsToExcel(
        rows,
        viewMode === "archived"
          ? "archived-academic-years.xlsx"
          : "academic-years.xlsx"
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
        toastError("No academic years to export.");
        return;
      }
      exportAcademicYearsToPdf(
        rows,
        viewMode === "archived"
          ? "archived-academic-years.pdf"
          : "academic-years.pdf"
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
        toastError("No academic years to print.");
        return;
      }
      printAcademicYears(rows);
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
    onEdit: (row) => openEditForm({ id: row.id }),
    onDelete: (row) => {
      setDeleteError("");
      setDeleteTarget(row);
    },
    onRestore: handleRestore,
    onAdd: openCreateForm,
    onExportExcel: handleExportExcel,
    onExportPdf: handleExportPdf,
    onPrint: handlePrint,
    emptyActionLabel: viewMode === "active" ? "Add Academic Year" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Academic Year Management"
        description="Define academic years, control the single Active year, and maintain the academic calendar."
        titleId="academic-years-page-heading"
      />

      <AcademicYearStats
        years={statsYears}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived academic years."
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
            <CalendarDays size={16} aria-hidden />
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
          icon={CalendarDays}
          title="Academic years unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : yearsQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedAcademicYears {...listProps} />
      ) : (
        <AcademicYearList {...listProps} />
      )}

      <AcademicYearProfile
        open={profileOpen}
        academicYearId={profileAcademicYearId}
        onClose={() => {
          setProfileOpen(false);
          setProfileAcademicYearId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <AcademicYearForm
        open={formOpen}
        mode={formMode}
        academicYear={formMode === "edit" ? editingAcademicYear : null}
        onClose={() => {
          setFormOpen(false);
          setEditingAcademicYear(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <AcademicYearDeleteDialog
        open={Boolean(deleteTarget)}
        academicYear={deleteTarget}
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
