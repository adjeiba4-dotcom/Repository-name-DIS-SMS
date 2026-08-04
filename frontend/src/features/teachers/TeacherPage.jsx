import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { EmptyState, Panel, SectionHeader } from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { DataTableSkeleton } from "../../components/ui/Skeleton";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getDepartments } from "../../services/departments/department.service";
import {
  deleteTeacher,
  getArchivedTeachers,
  getTeacherById,
  getTeachers,
  restoreTeacher,
} from "../../services/teachers/teacher.service";
import TeacherDeleteDialog from "./TeacherDeleteDialog";
import TeacherProfile from "./TeacherProfile";
import TeacherRegistrationForm from "./TeacherRegistrationForm";
import TeacherStats from "./TeacherStats";
import TeacherTable from "./TeacherTable";
import TeacherToolbar from "./TeacherToolbar";
import {
  exportTeachersToExcel,
  exportTeachersToPdf,
} from "./teacher.export";
import {
  getApiErrorMessage,
  mapDepartmentToOption,
  mapTeacherToRow,
} from "./teacher.mappers";

function filterTeachers(teachers, { query, status, departmentFilter, viewMode }) {
  const normalizedQuery = query.trim().toLowerCase();

  return teachers.filter((teacher) => {
    const matchesStatus =
      viewMode === "archived" ||
      status === "all" ||
      teacher.status === status;
    const matchesDepartment =
      departmentFilter === "all" || teacher.department === departmentFilter;

    if (!matchesStatus || !matchesDepartment) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      teacher.name,
      teacher.staffNo,
      teacher.email,
      teacher.phone,
      teacher.department,
      teacher.qualification,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

/**
 * Teachers module workspace — production-polished list/profile/CRUD.
 * Session expiry / token refresh is handled globally by axios (same as Students).
 */
export default function TeacherPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState("active");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTeacherId, setProfileTeacherId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await getTeachers();
      return response?.data ?? [];
    },
  });

  const archivedQuery = useQuery({
    queryKey: ["teachers", "archived"],
    queryFn: async () => {
      const response = await getArchivedTeachers();
      return response?.data ?? [];
    },
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await getDepartments();
      return (response?.data ?? []).map(mapDepartmentToOption);
    },
  });

  const activeRaw = teachersQuery.data ?? [];
  const archivedRaw = archivedQuery.data ?? [];
  const rawTeachers = viewMode === "archived" ? archivedRaw : activeRaw;

  const activeTeachers = useMemo(
    () => activeRaw.map(mapTeacherToRow),
    [activeRaw]
  );
  const archivedTeachers = useMemo(
    () => archivedRaw.map(mapTeacherToRow),
    [archivedRaw]
  );
  const teachersForStats = useMemo(
    () => [...activeTeachers, ...archivedTeachers],
    [activeTeachers, archivedTeachers]
  );

  const directoryTeachers =
    viewMode === "archived" ? archivedTeachers : activeTeachers;
  const departmentOptions = departmentsQuery.data ?? [];

  const filteredTeachers = useMemo(
    () =>
      filterTeachers(directoryTeachers, {
        query,
        status,
        departmentFilter,
        viewMode,
      }),
    [directoryTeachers, query, status, departmentFilter, viewMode]
  );

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setDepartmentFilter("all");
  };

  const hasActiveFilters =
    query.trim() !== "" || status !== "all" || departmentFilter !== "all";

  const refreshTeachers = () => {
    queryClient.invalidateQueries({ queryKey: ["teachers"] });
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingTeacher(null);
    setFormOpen(true);
  };

  const openEditForm = async (teacherLike) => {
    const id = teacherLike?.id;
    if (!id) return;

    setProfileOpen(false);
    setFormLoading(true);

    try {
      const response = await getTeacherById(id);
      setEditingTeacher(response?.data ?? teacherLike);
    } catch {
      setEditingTeacher(teacherLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
      setFormLoading(false);
    }
  };

  const handleView = (row) => {
    setProfileTeacherId(row.id);
    setProfileOpen(true);
  };

  const handleEditFromRow = (row) => {
    const raw = rawTeachers.find((item) => String(item.id) === String(row.id));
    openEditForm(raw ?? { id: row.id });
  };

  const handleDeleteRequest = (row) => {
    setDeleteError("");
    setDeleteTarget(row);
  };

  const handleFormSuccess = (_teacher, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Teacher updated successfully."
          : "Teacher created successfully.")
    );
    refreshTeachers();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await deleteTeacher(deleteTarget.id);
      toastSuccess(response?.message || "Teacher archived successfully.");
      setDeleteTarget(null);
      refreshTeachers();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, "Unable to archive teacher. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreTeacher(row.id);
      toastSuccess(response?.message || "Teacher restored successfully.");
      refreshTeachers();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to restore teacher. Please try again.")
      );
    }
  };

  const handleExportExcel = () => {
    try {
      exportTeachersToExcel(
        filteredTeachers,
        viewMode === "archived" ? "archived-teachers.xlsx" : "teachers.xlsx"
      );
      toastSuccess("Excel export ready.");
    } catch (error) {
      toastError(error?.message || "Excel export failed.");
    }
  };

  const handleExportPdf = () => {
    try {
      exportTeachersToPdf(
        filteredTeachers,
        viewMode === "archived" ? "archived-teachers.pdf" : "teachers.pdf"
      );
      toastSuccess("PDF export ready.");
    } catch (error) {
      toastError(error?.message || "PDF export failed.");
    }
  };

  const activeListError = teachersQuery.isError
    ? getApiErrorMessage(
        teachersQuery.error,
        "Unable to load teachers. Please try again."
      )
    : "";
  const archivedListError = archivedQuery.isError
    ? getApiErrorMessage(
        archivedQuery.error,
        "Unable to load archived teachers."
      )
    : "";
  const listError = viewMode === "archived" ? archivedListError : activeListError;
  const listLoading =
    viewMode === "archived" ? archivedQuery.isLoading : teachersQuery.isLoading;

  const departmentsError = departmentsQuery.isError
    ? getApiErrorMessage(
        departmentsQuery.error,
        "Unable to load departments for registration."
      )
    : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Teacher Management"
        description="Review staffing, open profiles, and manage teacher records."
        titleId="teachers-page-heading"
        actions={
          hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-auto"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      <TeacherStats
        teachers={teachersForStats}
        loading={teachersQuery.isLoading}
      />

      <Panel
        title="Directory Controls"
        description="Search, filter, export, and switch between active and archived teachers."
      >
        <TeacherToolbar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          departmentOptions={departmentOptions}
          resultCount={filteredTeachers.length}
          totalCount={directoryTeachers.length}
          onAddTeacher={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          disabled={listLoading}
        />
      </Panel>

      {listLoading ? (
        <Panel
          title={
            viewMode === "archived" ? "Archived Teachers" : "Teacher Directory"
          }
          description="Loading records…"
        >
          <DataTableSkeleton rows={6} label="Loading teacher directory" />
        </Panel>
      ) : listError ? (
        <EmptyState
          icon={Users}
          title="Teachers unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : teachersQuery.refetch()
          }
        />
      ) : (
        <TeacherTable
          teachers={filteredTeachers}
          mode={viewMode}
          onView={handleView}
          onEdit={handleEditFromRow}
          onDelete={handleDeleteRequest}
          onRestore={handleRestore}
        />
      )}

      <TeacherProfile
        open={profileOpen}
        teacherId={profileTeacherId}
        onClose={() => {
          setProfileOpen(false);
          setProfileTeacherId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <TeacherRegistrationForm
        open={formOpen}
        mode={formMode}
        teacher={formMode === "edit" ? editingTeacher : null}
        onClose={() => {
          if (formLoading) return;
          setFormOpen(false);
          setEditingTeacher(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
        departmentOptions={departmentOptions}
        departmentsLoading={departmentsQuery.isLoading || formLoading}
        departmentsError={departmentsError}
      />

      <TeacherDeleteDialog
        open={Boolean(deleteTarget)}
        teacher={deleteTarget}
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
