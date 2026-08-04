import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, School } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteClass,
  getArchivedClasses,
  getClassById,
  getClasses,
  restoreClass,
} from "../../services/classes/class.service";
import ArchivedClasses from "./ArchivedClasses";
import ClassDeleteDialog from "./ClassDeleteDialog";
import ClassForm from "./ClassForm";
import ClassList from "./ClassList";
import ClassProfile from "./ClassProfile";
import ClassStats from "./ClassStats";
import {
  exportClassesToExcel,
  exportClassesToPdf,
  printClasses,
} from "./class.export";
import { getApiErrorMessage, mapClassToRow } from "./class.mappers";

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
 * Classes module workspace — list, archive, form, details.
 */
export default function ClassPage() {
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
  const [profileClassId, setProfileClassId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingClass, setEditingClass] = useState(null);

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

  const classesQuery = useQuery({
    queryKey: ["classes", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getClasses({
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
    queryKey: ["classes", "archived"],
    queryFn: async () => {
      const response = await getArchivedClasses();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["classes", "stats-active"],
    queryFn: async () => {
      const response = await getClasses({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshClasses = () => {
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (classesQuery.data?.data ?? []).map(mapClassToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [classesQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapClassToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.className.toLowerCase().includes(needle) ||
          row.classCode.toLowerCase().includes(needle) ||
          row.academicYearName.toLowerCase().includes(needle) ||
          row.departmentName.toLowerCase().includes(needle)
      );
    }
    return sortRows(rows, sortKey, sortDirection);
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const archivedTotal = archivedMapped.length;
  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsClasses = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapClassToRow);
    const archived = (archivedQuery.data ?? []).map(mapClassToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? classesQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : classesQuery.isLoading && !classesQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived classes."
          )
        : ""
      : classesQuery.isError
        ? getApiErrorMessage(
            classesQuery.error,
            "Unable to load classes. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingClass(null);
    setFormOpen(true);
  };

  const openEditForm = async (classLike) => {
    const id = classLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getClassById(id);
      setEditingClass(response?.data ?? classLike);
    } catch {
      setEditingClass(classLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileClassId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_schoolClass, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Class updated successfully."
          : "Class created successfully.")
    );
    refreshClasses();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteClass(deleteTarget.id);
      toastSuccess(response?.message || "Class archived successfully.");
      setDeleteTarget(null);
      refreshClasses();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, "Unable to archive class. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreClass(row.id);
      toastSuccess(response?.message || "Class restored successfully.");
      refreshClasses();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to restore class. Please try again.")
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getClasses({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapClassToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No classes to export.");
        return;
      }
      exportClassesToExcel(
        rows,
        viewMode === "archived" ? "archived-classes.xlsx" : "classes.xlsx"
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
        toastError("No classes to export.");
        return;
      }
      exportClassesToPdf(
        rows,
        viewMode === "archived" ? "archived-classes.pdf" : "classes.pdf"
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
        toastError("No classes to print.");
        return;
      }
      printClasses(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Class" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Class Management"
        description="Organize school classes by academic year, assign departments and class teachers, and manage capacity."
        titleId="classes-page-heading"
      />

      <ClassStats
        classes={statsClasses}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived classes."
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
            <School size={16} aria-hidden />
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
          icon={School}
          title="Classes unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : classesQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedClasses {...listProps} />
      ) : (
        <ClassList {...listProps} />
      )}

      <ClassProfile
        open={profileOpen}
        classId={profileClassId}
        onClose={() => {
          setProfileOpen(false);
          setProfileClassId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <ClassForm
        open={formOpen}
        mode={formMode}
        schoolClass={formMode === "edit" ? editingClass : null}
        onClose={() => {
          setFormOpen(false);
          setEditingClass(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <ClassDeleteDialog
        open={Boolean(deleteTarget)}
        schoolClass={deleteTarget}
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
