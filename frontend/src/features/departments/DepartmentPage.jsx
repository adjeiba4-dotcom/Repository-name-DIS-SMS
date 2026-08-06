import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Building2, Plus } from "lucide-react";

import { EmptyState, Panel } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteDepartment,
  getArchivedDepartments,
  getDepartmentById,
  getDepartments,
  restoreDepartment,
  searchDepartments,
} from "../../services/departments/department.service";
import ArchivedDepartments from "./ArchivedDepartments";
import DepartmentDeleteDialog from "./DepartmentDeleteDialog";
import DepartmentForm from "./DepartmentForm";
import DepartmentList from "./DepartmentList";
import DepartmentProfile from "./DepartmentProfile";
import DepartmentStats from "./DepartmentStats";
import {
  exportDepartmentsToExcel,
  exportDepartmentsToPdf,
  printDepartments,
} from "./department.export";
import { getApiErrorMessage, mapDepartmentToRow } from "./department.mappers";

const SEARCH_DEBOUNCE_MS = 400;

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
 * Departments module workspace — list, archive, form, details.
 */
export default function DepartmentPage() {
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
  const [profileDepartmentId, setProfileDepartmentId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingDepartment, setEditingDepartment] = useState(null);

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

  const departmentsQuery = useQuery({
    queryKey: ["departments", "active", debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch) {
        const response = await searchDepartments(debouncedSearch);
        return response?.data ?? [];
      }
      const response = await getDepartments();
      return response?.data ?? [];
    },
    enabled: viewMode === "active",
  });

  const archivedQuery = useQuery({
    queryKey: ["departments", "archived"],
    queryFn: async () => {
      const response = await getArchivedDepartments();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["departments", "stats-active"],
    queryFn: async () => {
      const response = await getDepartments();
      return response?.data ?? [];
    },
  });

  const refreshDepartments = () => {
    queryClient.invalidateQueries({ queryKey: ["departments"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (departmentsQuery.data ?? []).map(mapDepartmentToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [departmentsQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapDepartmentToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(needle) ||
          row.code.toLowerCase().includes(needle) ||
          row.description.toLowerCase().includes(needle)
      );
    }
    return sortRows(rows, sortKey, sortDirection);
  }, [archivedQuery.data, debouncedSearch, sortKey, sortDirection]);

  const activeTotal = activeMapped.length;
  const archivedTotal = archivedMapped.length;

  const activePageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeMapped.slice(start, start + pageSize);
  }, [activeMapped, page, pageSize]);

  const archivedPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivedMapped.slice(start, start + pageSize);
  }, [archivedMapped, page, pageSize]);

  const statsDepartments = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapDepartmentToRow);
    const archived = (archivedQuery.data ?? []).map(mapDepartmentToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const listRows = viewMode === "archived" ? archivedPageRows : activePageRows;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : departmentsQuery.isLoading && !departmentsQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived departments."
          )
        : ""
      : departmentsQuery.isError
        ? getApiErrorMessage(
            departmentsQuery.error,
            "Unable to load departments. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingDepartment(null);
    setFormOpen(true);
  };

  const openEditForm = async (departmentLike) => {
    const id = departmentLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getDepartmentById(id);
      setEditingDepartment(response?.data ?? departmentLike);
    } catch {
      setEditingDepartment(departmentLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileDepartmentId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_department, message, action = "create") => {
    const fallback =
      action === "update"
        ? "Department updated successfully."
        : action === "restore"
          ? "Department restored successfully."
          : "Department created successfully.";
    toastSuccess(message || fallback);
    if (action === "restore") {
      setViewMode("active");
    }
    refreshDepartments();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteDepartment(deleteTarget.id);
      toastSuccess(response?.message || "Department archived successfully.");
      setDeleteTarget(null);
      refreshDepartments();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive department. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreDepartment(row.id);
      toastSuccess(response?.message || "Department restored successfully.");
      refreshDepartments();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore department. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }
    return activeMapped;
  };

  const handleExportExcel = () => {
    try {
      const rows = resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No departments to export.");
        return;
      }
      exportDepartmentsToExcel(
        rows,
        viewMode === "archived"
          ? "archived-departments.xlsx"
          : "departments.xlsx"
      );
      toastSuccess("Excel export ready.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "Excel export failed."));
    }
  };

  const handleExportPdf = () => {
    try {
      const rows = resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No departments to export.");
        return;
      }
      exportDepartmentsToPdf(
        rows,
        viewMode === "archived"
          ? "archived-departments.pdf"
          : "departments.pdf"
      );
      toastSuccess("PDF export ready.");
    } catch (error) {
      toastError(getApiErrorMessage(error, "PDF export failed."));
    }
  };

  const handlePrint = () => {
    try {
      const rows = resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No departments to print.");
        return;
      }
      printDepartments(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Department" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <PageHeader
        eyebrow="Organization"
        title="Department Management"
        description="Organize academic departments that teachers, subjects, and classes belong to."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Departments" },
        ]}
        primaryAction={{
          label: "Add Department",
          onClick: openCreateForm,
          icon: Plus,
          disabled: listLoading,
        }}
      />

      <DepartmentStats
        departments={statsDepartments}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived departments."
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
            <Building2 size={16} aria-hidden />
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
          icon={Building2}
          title="Departments unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : departmentsQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedDepartments {...listProps} />
      ) : (
        <DepartmentList {...listProps} />
      )}

      <DepartmentProfile
        open={profileOpen}
        departmentId={profileDepartmentId}
        onClose={() => {
          setProfileOpen(false);
          setProfileDepartmentId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <DepartmentForm
        open={formOpen}
        mode={formMode}
        department={formMode === "edit" ? editingDepartment : null}
        onClose={() => {
          setFormOpen(false);
          setEditingDepartment(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <DepartmentDeleteDialog
        open={Boolean(deleteTarget)}
        department={deleteTarget}
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
