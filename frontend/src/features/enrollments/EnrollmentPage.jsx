import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, ClipboardList } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteEnrollment,
  getArchivedEnrollments,
  getEnrollmentById,
  getEnrollments,
  restoreEnrollment,
} from "../../services/enrollments/enrollment.service";
import ArchivedEnrollments from "./ArchivedEnrollments";
import EnrollmentDeleteDialog from "./EnrollmentDeleteDialog";
import EnrollmentForm from "./EnrollmentForm";
import EnrollmentList from "./EnrollmentList";
import EnrollmentProfile from "./EnrollmentProfile";
import EnrollmentStats from "./EnrollmentStats";
import {
  exportEnrollmentsToExcel,
  exportEnrollmentsToPdf,
  printEnrollments,
} from "./enrollment.export";
import {
  getApiErrorMessage,
  mapEnrollmentToRow,
} from "./enrollment.mappers";

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
 * Student Enrollment workspace — list, archive, form, details.
 */
export default function EnrollmentPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("enrollmentNumber");
  const [sortDirection, setSortDirection] = useState("desc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEnrollmentId, setProfileEnrollmentId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingEnrollment, setEditingEnrollment] = useState(null);

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
    queryKey: ["enrollments", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getEnrollments({
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
    queryKey: ["enrollments", "archived"],
    queryFn: async () => {
      const response = await getArchivedEnrollments();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["enrollments", "stats-active"],
    queryFn: async () => {
      const response = await getEnrollments({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshEnrollments = () => {
    queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (listQuery.data?.data ?? []).map(mapEnrollmentToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [listQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapEnrollmentToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.enrollmentNumber.toLowerCase().includes(needle) ||
          row.studentName.toLowerCase().includes(needle) ||
          row.admissionNo.toLowerCase().includes(needle) ||
          row.className.toLowerCase().includes(needle) ||
          row.classCode.toLowerCase().includes(needle) ||
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

  const statsEnrollments = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapEnrollmentToRow);
    const archived = (archivedQuery.data ?? []).map(mapEnrollmentToRow);
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
            "Unable to load archived enrollments."
          )
        : ""
      : listQuery.isError
        ? getApiErrorMessage(
            listQuery.error,
            "Unable to load enrollments. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingEnrollment(null);
    setFormOpen(true);
  };

  const openEditForm = async (enrollmentLike) => {
    const id = enrollmentLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getEnrollmentById(id);
      setEditingEnrollment(response?.data ?? enrollmentLike);
    } catch {
      setEditingEnrollment(enrollmentLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileEnrollmentId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_enrollment, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Enrollment updated successfully."
          : "Enrollment created successfully.")
    );
    refreshEnrollments();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteEnrollment(deleteTarget.id);
      toastSuccess(
        response?.message || "Enrollment archived successfully."
      );
      setDeleteTarget(null);
      refreshEnrollments();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive enrollment. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreEnrollment(row.id, { activate: true });
      toastSuccess(
        response?.message || "Enrollment restored successfully."
      );
      refreshEnrollments();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore enrollment. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getEnrollments({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapEnrollmentToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No enrollments to export.");
        return;
      }
      exportEnrollmentsToExcel(
        rows,
        viewMode === "archived"
          ? "archived-enrollments.xlsx"
          : "enrollments.xlsx"
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
        toastError("No enrollments to export.");
        return;
      }
      exportEnrollmentsToPdf(
        rows,
        viewMode === "archived"
          ? "archived-enrollments.pdf"
          : "enrollments.pdf"
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
        toastError("No enrollments to print.");
        return;
      }
      printEnrollments(rows);
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
    emptyActionLabel: viewMode === "active" ? "Enroll Student" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Student Enrollment"
        description="Place students into classes for an academic year, with capacity checks and one-enrollment-per-year protection."
        titleId="enrollments-page-heading"
      />

      <EnrollmentStats
        enrollments={statsEnrollments}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived enrollments."
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
            <ClipboardList size={16} aria-hidden />
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
          icon={ClipboardList}
          title="Enrollments unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : listQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedEnrollments {...listProps} />
      ) : (
        <EnrollmentList {...listProps} />
      )}

      <EnrollmentProfile
        open={profileOpen}
        enrollmentId={profileEnrollmentId}
        onClose={() => {
          setProfileOpen(false);
          setProfileEnrollmentId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <EnrollmentForm
        open={formOpen}
        mode={formMode}
        enrollment={formMode === "edit" ? editingEnrollment : null}
        onClose={() => {
          setFormOpen(false);
          setEditingEnrollment(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <EnrollmentDeleteDialog
        open={Boolean(deleteTarget)}
        enrollment={deleteTarget}
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
