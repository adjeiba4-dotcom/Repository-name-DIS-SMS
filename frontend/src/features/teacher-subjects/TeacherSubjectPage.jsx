import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Archive, BookUser } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  deleteTeacherSubject,
  getArchivedTeacherSubjects,
  getTeacherSubjectById,
  getTeacherSubjects,
  restoreTeacherSubject,
} from "../../services/teacher-subjects/teacherSubject.service";
import ArchivedTeacherSubjects from "./ArchivedTeacherSubjects";
import TeacherSubjectDeleteDialog from "./TeacherSubjectDeleteDialog";
import TeacherSubjectForm from "./TeacherSubjectForm";
import TeacherSubjectList from "./TeacherSubjectList";
import TeacherSubjectProfile from "./TeacherSubjectProfile";
import TeacherSubjectStats from "./TeacherSubjectStats";
import {
  exportTeacherSubjectsToExcel,
  exportTeacherSubjectsToPdf,
  printTeacherSubjects,
} from "./teacherSubject.export";
import {
  getApiErrorMessage,
  mapTeacherSubjectToRow,
} from "./teacherSubject.mappers";

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
 * Teacher Subject Assignment workspace — list, archive, form, details.
 */
export default function TeacherSubjectPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("teacherName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAssignmentId, setProfileAssignmentId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingAssignment, setEditingAssignment] = useState(null);

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
    queryKey: ["teacher-subjects", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await getTeacherSubjects({
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
    queryKey: ["teacher-subjects", "archived"],
    queryFn: async () => {
      const response = await getArchivedTeacherSubjects();
      return response?.data ?? [];
    },
  });

  const statsActiveQuery = useQuery({
    queryKey: ["teacher-subjects", "stats-active"],
    queryFn: async () => {
      const response = await getTeacherSubjects({ page: 1, limit: 100 });
      return response?.data ?? [];
    },
  });

  const refreshAssignments = () => {
    queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
  };

  const activeMapped = useMemo(() => {
    const rows = (listQuery.data?.data ?? []).map(mapTeacherSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  }, [listQuery.data, status, sortKey, sortDirection]);

  const archivedMapped = useMemo(() => {
    let rows = (archivedQuery.data ?? []).map(mapTeacherSubjectToRow);
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.teacherName.toLowerCase().includes(needle) ||
          row.subjectName.toLowerCase().includes(needle) ||
          row.subjectCode.toLowerCase().includes(needle) ||
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

  const statsAssignments = useMemo(() => {
    const active = (statsActiveQuery.data ?? []).map(mapTeacherSubjectToRow);
    const archived = (archivedQuery.data ?? []).map(mapTeacherSubjectToRow);
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
            "Unable to load archived assignments."
          )
        : ""
      : listQuery.isError
        ? getApiErrorMessage(
            listQuery.error,
            "Unable to load assignments. Please try again."
          )
        : "";

  const openCreateForm = () => {
    setFormMode("create");
    setEditingAssignment(null);
    setFormOpen(true);
  };

  const openEditForm = async (assignmentLike) => {
    const id = assignmentLike?.id;
    if (!id) return;

    setProfileOpen(false);
    try {
      const response = await getTeacherSubjectById(id);
      setEditingAssignment(response?.data ?? assignmentLike);
    } catch {
      setEditingAssignment(assignmentLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
    }
  };

  const handleView = (row) => {
    setProfileAssignmentId(row.id);
    setProfileOpen(true);
  };

  const handleFormSuccess = (_assignment, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Assignment updated successfully."
          : "Assignment created successfully.")
    );
    refreshAssignments();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await deleteTeacherSubject(deleteTarget.id);
      toastSuccess(
        response?.message || "Assignment archived successfully."
      );
      setDeleteTarget(null);
      refreshAssignments();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to archive assignment. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreTeacherSubject(row.id);
      toastSuccess(
        response?.message || "Assignment restored successfully."
      );
      refreshAssignments();
    } catch (error) {
      toastError(
        getApiErrorMessage(
          error,
          "Unable to restore assignment. Please try again."
        )
      );
    }
  };

  const resolveFilteredExportRows = async () => {
    if (viewMode === "archived") {
      return archivedMapped;
    }

    const response = await getTeacherSubjects({
      page: 1,
      limit: EXPORT_PAGE_LIMIT,
      search: debouncedSearch || undefined,
    });
    const rows = (response?.data ?? []).map(mapTeacherSubjectToRow);
    return sortRows(applyStatusFilter(rows, status), sortKey, sortDirection);
  };

  const handleExportExcel = async () => {
    try {
      const rows = await resolveFilteredExportRows();
      if (!rows.length) {
        toastError("No assignments to export.");
        return;
      }
      exportTeacherSubjectsToExcel(
        rows,
        viewMode === "archived"
          ? "archived-teacher-subjects.xlsx"
          : "teacher-subjects.xlsx"
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
        toastError("No assignments to export.");
        return;
      }
      exportTeacherSubjectsToPdf(
        rows,
        viewMode === "archived"
          ? "archived-teacher-subjects.pdf"
          : "teacher-subjects.pdf"
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
        toastError("No assignments to print.");
        return;
      }
      printTeacherSubjects(rows);
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
    emptyActionLabel: viewMode === "active" ? "Add Assignment" : undefined,
    onEmptyAction: viewMode === "active" ? openCreateForm : undefined,
  };

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Teacher Subject Assignment"
        description="Assign teachers to subjects by academic year and term, with weekly periods and primary-teacher flags."
        titleId="teacher-subjects-page-heading"
      />

      <TeacherSubjectStats
        assignments={statsAssignments}
        loading={statsActiveQuery.isLoading && archivedQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Switch between active and archived assignments."
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
            <BookUser size={16} aria-hidden />
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
          icon={BookUser}
          title="Assignments unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : listQuery.refetch()
          }
        />
      ) : viewMode === "archived" ? (
        <ArchivedTeacherSubjects {...listProps} />
      ) : (
        <TeacherSubjectList {...listProps} />
      )}

      <TeacherSubjectProfile
        open={profileOpen}
        assignmentId={profileAssignmentId}
        onClose={() => {
          setProfileOpen(false);
          setProfileAssignmentId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <TeacherSubjectForm
        open={formOpen}
        mode={formMode}
        assignment={formMode === "edit" ? editingAssignment : null}
        onClose={() => {
          setFormOpen(false);
          setEditingAssignment(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
      />

      <TeacherSubjectDeleteDialog
        open={Boolean(deleteTarget)}
        assignment={deleteTarget}
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
