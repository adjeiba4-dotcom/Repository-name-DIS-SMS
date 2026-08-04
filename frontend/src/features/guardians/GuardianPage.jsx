import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, UserRound, Users } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteGuardian,
  getArchivedGuardians,
  getGuardianById,
  getGuardians,
  restoreGuardian,
} from "../../services/guardians/guardian.service";
import ArchivedGuardians from "./ArchivedGuardians";
import GuardianDeleteDialog from "./GuardianDeleteDialog";
import GuardianForm from "./GuardianForm";
import GuardianList from "./GuardianList";
import GuardianProfile from "./GuardianProfile";
import GuardianStats from "./GuardianStats";
import {
  exportGuardiansToExcel,
  exportGuardiansToPdf,
  printGuardians,
} from "./guardian.export";
import {
  getApiErrorMessage,
  mapGuardianToRow,
} from "./guardian.mappers";

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
 * Guardians module workspace — list, archive, form, profile, relationships.
 */
export default function GuardianPage() {
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
  const [profileGuardianId, setProfileGuardianId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingGuardian, setEditingGuardian] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Debounce search input before hitting the Guardian API (300–500 ms).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to first page when list filters change (React-approved render adjustment).
  const [filterKey, setFilterKey] = useState(
    () => `${debouncedSearch}|${viewMode}|${status}|${pageSize}`
  );
  const nextFilterKey = `${debouncedSearch}|${viewMode}|${status}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    setPage(1);
  }

  const guardiansQuery = useQuery({
    queryKey: ["guardians", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getGuardians({
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
    queryKey: ["guardians", "archived"],
    queryFn: async () => {
      const response = await getArchivedGuardians();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["guardians", "stats-active"],
    queryFn: async () => {
      const response = await getGuardians({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshGuardians = () => {
    queryClient.invalidateQueries({ queryKey: ["guardians"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (guardiansQuery.data?.data ?? []).map(mapGuardianToRow);
    return sortRows(
      applyStatusFilter(rows, status),
      sortKey,
      sortDirection
    );
  }, [guardiansQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapGuardianToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter((row) =>
        [
          row.name,
          row.firstName,
          row.lastName,
          row.guardianNumber,
          row.phone,
          row.email,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    rows = sortRows(rows, sortKey, sortDirection);
    return rows;
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const archivedTotal = archivedMapped.length;
  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsGuardians = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapGuardianToRow);
    const archived = (archivedQuery.data ?? []).map(mapGuardianToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? guardiansQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  // Keep previous rows visible while search refetch runs so the table refreshes in place.
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : guardiansQuery.isLoading && !guardiansQuery.data;
  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived guardians."
          )
        : ""
      : guardiansQuery.isError
        ? getApiErrorMessage(
            guardiansQuery.error,
            "Unable to load guardians. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingGuardian(null);
    setFormOpen(true);
  };

  const openEditForm = async (guardianLike) => {
    const id = guardianLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getGuardianById(id);
      setEditingGuardian(response?.data ?? guardianLike);
    } catch {
      setEditingGuardian(guardianLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileGuardianId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_guardian, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Guardian updated successfully."
          : "Guardian created successfully.")
    );
    refreshGuardians();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteGuardian(deleteTarget.id);
      toastSuccess(response?.message || "Guardian archived successfully.");
      setDeleteTarget(null);
      refreshGuardians();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive guardian. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreGuardian(row.id);
      toastSuccess(response?.message || "Guardian restored successfully.");
      refreshGuardians();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore guardian. Please try again."
        )
      );
    }
  };

  /**
   * Resolve the currently filtered guardian set for Excel / PDF / Print.
   * Active directory uses the API search; archived filters client-side.
   */
  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getGuardians({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapGuardianToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No guardians to export.");
        return;
      }
      exportGuardiansToExcel(
        rows,
        viewMode === "archived" ? "archived-guardians.xlsx" : "guardians.xlsx"
      );
      toastSuccess("Excel export ready.");
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Excel export failed.")
      );
    }
  };

  const handleExportPdf = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No guardians to export.");
        return;
      }
      exportGuardiansToPdf(
        rows,
        viewMode === "archived" ? "archived-guardians.pdf" : "guardians.pdf"
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
        toastError("No guardians to print.");
        return;
      }
      printGuardians(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Guardian" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Guardian Management"
        description="Register guardians, manage student relationships, and maintain family contacts."
        titleId="guardians-page-heading"
      />

      <GuardianStats
        guardians={statsGuardians}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived guardians."
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
            <Users size={16} aria-hidden />
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
          icon={UserRound}
          title="Guardians unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : guardiansQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedGuardians {...listProps} />
      ) : (
        <GuardianList {...listProps} />
      )}

      <GuardianProfile
        open={profileOpen}
        guardianId={profileGuardianId}
        onClose={() => {
          setProfileOpen(false);
          setProfileGuardianId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
        onChanged={refreshGuardians}
      />

      <GuardianForm
        open={formOpen}
        mode={formMode}
        guardian={formMode === "edit" ? editingGuardian : null}
        onClose={() => {
          setFormOpen(false);
          setEditingGuardian(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <GuardianDeleteDialog
        open={Boolean(deleteTarget)}
        guardian={deleteTarget}
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
