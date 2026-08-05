import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, BookMarked } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteClassSubject,
  getArchivedClassSubjects,
  getClassSubjectById,
  getClassSubjects,
  restoreClassSubject,
} from "../../services/class-subjects/classSubject.service";
import ArchivedClassSubjects from "./ArchivedClassSubjects";
import ClassSubjectDeleteDialog from "./ClassSubjectDeleteDialog";
import ClassSubjectForm from "./ClassSubjectForm";
import ClassSubjectList from "./ClassSubjectList";
import ClassSubjectProfile from "./ClassSubjectProfile";
import ClassSubjectStats from "./ClassSubjectStats";
import {
  exportClassSubjectsToExcel,
  exportClassSubjectsToPdf,
  printClassSubjects,
} from "./classSubject.export";
import {
  getApiErrorMessage,
  mapClassSubjectToRow,
} from "./classSubject.mappers";

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
 * Class Subject Allocation workspace — list, archive, form, details.
 */
export default function ClassSubjectPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("className");
  const [sortDirection, setSortDirection] = useState("asc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAllocationId, setProfileAllocationId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingAllocation, setEditingAllocation] = useState(null);

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

  const listQuery = useQuery({
    queryKey: ["class-subjects", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getClassSubjects({
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
    queryKey: ["class-subjects", "archived"],
    queryFn: async () => {
      const response = await getArchivedClassSubjects();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["class-subjects", "stats-active"],
    queryFn: async () => {
      const response = await getClassSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshAllocations = () => {
    queryClient.invalidateQueries({ queryKey: ["class-subjects"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (listQuery.data?.data ?? []).map(mapClassSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [listQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapClassSubjectToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.className.toLowerCase().includes(needle) ||
          row.classCode.toLowerCase().includes(needle) ||
          row.subjectName.toLowerCase().includes(needle) ||
          row.subjectCode.toLowerCase().includes(needle) ||
          row.teacherName.toLowerCase().includes(needle) ||
          row.academicYearName.toLowerCase().includes(needle) ||
          row.termName.toLowerCase().includes(needle)
      );
    }
    return sortRows(rows, sortKey, sortDirection);
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const archivedTotal = archivedMapped.length;
  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsAllocations = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapClassSubjectToRow);
    const archived = (archivedQuery.data ?? []).map(mapClassSubjectToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? listQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : listQuery.isLoading && !listQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived allocations."
          )
        : ""
      : listQuery.isError
        ? getApiErrorMessage(
            listQuery.error,
            "Unable to load allocations. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingAllocation(null);
    setFormOpen(true);
  };

  const openEditForm = async (allocationLike) => {
    const id = allocationLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getClassSubjectById(id);
      setEditingAllocation(response?.data ?? allocationLike);
    } catch {
      setEditingAllocation(allocationLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileAllocationId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_allocation, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Allocation updated successfully."
          : "Allocation created successfully.")
    );
    refreshAllocations();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteClassSubject(deleteTarget.id);
      toastSuccess(
        response?.message || "Allocation archived successfully."
      );
      setDeleteTarget(null);
      refreshAllocations();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive allocation. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreClassSubject(row.id);
      toastSuccess(
        response?.message || "Allocation restored successfully."
      );
      refreshAllocations();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore allocation. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getClassSubjects({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapClassSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No allocations to export.");
        return;
      }
      exportClassSubjectsToExcel(
        rows,
        viewMode === "archived"
          ? "archived-class-subjects.xlsx"
          : "class-subjects.xlsx"
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
        toastError("No allocations to export.");
        return;
      }
      exportClassSubjectsToPdf(
        rows,
        viewMode === "archived"
          ? "archived-class-subjects.pdf"
          : "class-subjects.pdf"
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
        toastError("No allocations to print.");
        return;
      }
      printClassSubjects(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Allocation" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Class Subject Allocation"
        description="Allocate subjects to classes via teacher subject assignments, with weekly periods and compulsory flags."
        titleId="class-subjects-page-heading"
      />

      <ClassSubjectStats
        allocations={statsAllocations}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived allocations."
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
            <BookMarked size={16} aria-hidden />
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
          icon={BookMarked}
          title="Allocations unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : listQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedClassSubjects {...listProps} />
      ) : (
        <ClassSubjectList {...listProps} />
      )}

      <ClassSubjectProfile
        open={profileOpen}
        allocationId={profileAllocationId}
        onClose={() => {
          setProfileOpen(false);
          setProfileAllocationId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <ClassSubjectForm
        open={formOpen}
        mode={formMode}
        allocation={formMode === "edit" ? editingAllocation : null}
        onClose={() => {
          setFormOpen(false);
          setEditingAllocation(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <ClassSubjectDeleteDialog
        open={Boolean(deleteTarget)}
        allocation={deleteTarget}
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
