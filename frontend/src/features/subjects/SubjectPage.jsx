import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, BookOpen } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteSubject,
  getArchivedSubjects,
  getSubjectById,
  getSubjects,
  restoreSubject,
} from "../../services/subjects/subject.service";
import ArchivedSubjects from "./ArchivedSubjects";
import SubjectDeleteDialog from "./SubjectDeleteDialog";
import SubjectForm from "./SubjectForm";
import SubjectList from "./SubjectList";
import SubjectProfile from "./SubjectProfile";
import SubjectStats from "./SubjectStats";
import {
  exportSubjectsToExcel,
  exportSubjectsToPdf,
  printSubjects,
} from "./subject.export";
import { getApiErrorMessage, mapSubjectToRow } from "./subject.mappers";

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
 * Subjects module workspace — list, archive, form, details.
 */
export default function SubjectPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("subjectName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSubjectId, setProfileSubjectId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingSubject, setEditingSubject] = useState(null);

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

  const subjectsQuery = useQuery({
    queryKey: ["subjects", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getSubjects({
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
    queryKey: ["subjects", "archived"],
    queryFn: async () => {
      const response = await getArchivedSubjects();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["subjects", "stats-active"],
    queryFn: async () => {
      const response = await getSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshSubjects = () => {
    queryClient.invalidateQueries({ queryKey: ["subjects"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (subjectsQuery.data?.data ?? []).map(mapSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [subjectsQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapSubjectToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.subjectName.toLowerCase().includes(needle) ||
          row.subjectCode.toLowerCase().includes(needle) ||
          row.shortName.toLowerCase().includes(needle) ||
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

  const statsSubjects = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapSubjectToRow);
    const archived = (archivedQuery.data ?? []).map(mapSubjectToRow);
    return [...active, ...archived];
  }, [statsActiveQuery.data, archivedQuery.data]);

  const activeTotal =
    status === "all"
      ? subjectsQuery.data?.pagination?.total ?? 0
      : activeMapped.length;

  const listRows = viewMode === "archived" ? archivedPageRows : activeMapped;
  const listTotal = viewMode === "archived" ? archivedTotal : activeTotal;
  const listLoading =
    viewMode === "archived"
      ? archivedQuery.isLoading
      : subjectsQuery.isLoading && !subjectsQuery.data;

  const listError =
    viewMode === "archived"
      ? archivedQuery.isError
        ? getApiErrorMessage(
            archivedQuery.error,
            "Unable to load archived subjects."
          )
        : ""
      : subjectsQuery.isError
        ? getApiErrorMessage(
            subjectsQuery.error,
            "Unable to load subjects. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingSubject(null);
    setFormOpen(true);
  };

  const openEditForm = async (subjectLike) => {
    const id = subjectLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getSubjectById(id);
      setEditingSubject(response?.data ?? subjectLike);
    } catch {
      setEditingSubject(subjectLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileSubjectId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_subject, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Subject updated successfully."
          : "Subject created successfully.")
    );
    refreshSubjects();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteSubject(deleteTarget.id);
      toastSuccess(response?.message || "Subject archived successfully.");
      setDeleteTarget(null);
      refreshSubjects();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive subject. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreSubject(row.id);
      toastSuccess(response?.message || "Subject restored successfully.");
      refreshSubjects();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore subject. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getSubjects({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No subjects to export.");
        return;
      }
      exportSubjectsToExcel(
        rows,
        viewMode === "archived" ? "archived-subjects.xlsx" : "subjects.xlsx"
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
        toastError("No subjects to export.");
        return;
      }
      exportSubjectsToPdf(
        rows,
        viewMode === "archived" ? "archived-subjects.pdf" : "subjects.pdf"
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
        toastError("No subjects to print.");
        return;
      }
      printSubjects(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Subject" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Subject Management"
        description="Organize the academic subject catalog by category, credits, department, and class assignment."
        titleId="subjects-page-heading"
      />

      <SubjectStats
        subjects={statsSubjects}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived subjects."
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
            <BookOpen size={16} aria-hidden />
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
          icon={BookOpen}
          title="Subjects unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : subjectsQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedSubjects {...listProps} />
      ) : (
        <SubjectList {...listProps} />
      )}

      <SubjectProfile
        open={profileOpen}
        subjectId={profileSubjectId}
        onClose={() => {
          setProfileOpen(false);
          setProfileSubjectId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <SubjectForm
        open={formOpen}
        mode={formMode}
        subject={formMode === "edit" ? editingSubject : null}
        onClose={() => {
          setFormOpen(false);
          setEditingSubject(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <SubjectDeleteDialog
        open={Boolean(deleteTarget)}
        subject={deleteTarget}
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
