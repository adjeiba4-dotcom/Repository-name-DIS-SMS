import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";

import {
  DashboardPanel,
  EmptyState,
  SectionHeader,
} from "../../components/dashboard";
import Button from "../../components/ui/Button";
import { StudentTableSkeleton } from "../../components/ui/Skeleton";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { getClasses } from "../../services/classes/class.service";
import {
  deleteStudent,
  getArchivedStudents,
  getStudentById,
  getStudents,
  restoreStudent,
} from "../../services/students/student.service";
import StudentDeleteDialog from "./StudentDeleteDialog";
import StudentProfile from "./StudentProfile";
import StudentRegistrationForm from "./StudentRegistrationForm";
import StudentStats from "./StudentStats";
import StudentTable from "./StudentTable";
import StudentToolbar from "./StudentToolbar";
import {
  exportStudentsToExcel,
  exportStudentsToPdf,
} from "./student.export";
import {
  getApiErrorMessage,
  mapClassToOption,
  mapStudentToRow,
} from "./student.mappers";

function filterStudents(students, { query, status, classFilter, viewMode }) {
  const normalizedQuery = query.trim().toLowerCase();

  return students.filter((student) => {
    const matchesStatus =
      viewMode === "archived" ||
      status === "all" ||
      student.status === status;
    const matchesClass =
      classFilter === "all" || student.className === classFilter;

    if (!matchesStatus || !matchesClass) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      student.name,
      student.studentId,
      student.email,
      student.phone,
      student.guardian,
      student.className,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

/**
 * Students module workspace — production-polished list/profile/CRUD.
 */
export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [viewMode, setViewMode] = useState("active");

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileStudentId, setProfileStudentId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await getStudents();
      return response?.data ?? [];
    },
  });

  const archivedQuery = useQuery({
    queryKey: ["students", "archived"],
    queryFn: async () => {
      const response = await getArchivedStudents();
      return response?.data ?? [];
    },
  });

  const classesQuery = useQuery({
    queryKey: ["classes", "student-options"],
    queryFn: async () => {
      const response = await getClasses({ page: 1, limit: 100 });
      return (response?.data ?? []).map(mapClassToOption);
    },
  });

  const activeRaw = studentsQuery.data ?? [];
  const archivedRaw = archivedQuery.data ?? [];
  const rawStudents = viewMode === "archived" ? archivedRaw : activeRaw;

  const activeStudents = useMemo(
    () => activeRaw.map(mapStudentToRow),
    [activeRaw]
  );
  const archivedStudents = useMemo(
    () => archivedRaw.map(mapStudentToRow),
    [archivedRaw]
  );
  const studentsForStats = useMemo(
    () => [...activeStudents, ...archivedStudents],
    [activeStudents, archivedStudents]
  );

  const directoryStudents = viewMode === "archived" ? archivedStudents : activeStudents;
  const classOptions = classesQuery.data ?? [];

  const filteredStudents = useMemo(
    () =>
      filterStudents(directoryStudents, {
        query,
        status,
        classFilter,
        viewMode,
      }),
    [directoryStudents, query, status, classFilter, viewMode]
  );

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setClassFilter("all");
  };

  const hasActiveFilters =
    query.trim() !== "" || status !== "all" || classFilter !== "all";

  const refreshStudents = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingStudent(null);
    setFormOpen(true);
  };

  const openEditForm = async (studentLike) => {
    const id = studentLike?.id;
    if (!id) return;

    setProfileOpen(false);
    setFormLoading(true);

    try {
      const response = await getStudentById(id);
      setEditingStudent(response?.data ?? studentLike);
    } catch {
      setEditingStudent(studentLike);
    } finally {
      setFormMode("edit");
      setFormOpen(true);
      setFormLoading(false);
    }
  };

  const handleView = (row) => {
    setProfileStudentId(row.id);
    setProfileOpen(true);
  };

  const handleEditFromRow = (row) => {
    const raw = rawStudents.find((item) => String(item.id) === String(row.id));
    openEditForm(raw ?? { id: row.id });
  };

  const handleDeleteRequest = (row) => {
    setDeleteError("");
    setDeleteTarget(row);
  };

  const handleFormSuccess = (_student, message, action = "create") => {
    toastSuccess(
      message ||
        (action === "update"
          ? "Student updated successfully."
          : "Student created successfully.")
    );
    refreshStudents();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await deleteStudent(deleteTarget.id);
      toastSuccess(response?.message || "Student archived successfully.");
      setDeleteTarget(null);
      refreshStudents();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, "Unable to archive student. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      const response = await restoreStudent(row.id);
      toastSuccess(response?.message || "Student restored successfully.");
      refreshStudents();
    } catch (error) {
      toastError(
        getApiErrorMessage(error, "Unable to restore student. Please try again.")
      );
    }
  };

  const handleExportExcel = () => {
    try {
      exportStudentsToExcel(
        filteredStudents,
        viewMode === "archived" ? "archived-students.xlsx" : "students.xlsx"
      );
      toastSuccess("Excel export ready.");
    } catch (error) {
      toastError(error?.message || "Excel export failed.");
    }
  };

  const handleExportPdf = () => {
    try {
      exportStudentsToPdf(
        filteredStudents,
        viewMode === "archived" ? "archived-students.pdf" : "students.pdf"
      );
      toastSuccess("PDF export ready.");
    } catch (error) {
      toastError(error?.message || "PDF export failed.");
    }
  };

  const activeListError = studentsQuery.isError
    ? getApiErrorMessage(
        studentsQuery.error,
        "Unable to load students. Please try again."
      )
    : "";
  const archivedListError = archivedQuery.isError
    ? getApiErrorMessage(
        archivedQuery.error,
        "Unable to load archived students."
      )
    : "";
  const listError = viewMode === "archived" ? archivedListError : activeListError;
  const listLoading =
    viewMode === "archived" ? archivedQuery.isLoading : studentsQuery.isLoading;

  const classesError = classesQuery.isError
    ? getApiErrorMessage(
        classesQuery.error,
        "Unable to load classes for registration."
      )
    : "";

  return (
    <div className="space-y-[var(--space-8)]">
      <SectionHeader
        eyebrow="Academics"
        title="Student Management"
        description="Review enrollment, open profiles, and manage student records."
        titleId="students-page-heading"
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

      <StudentStats
        students={studentsForStats}
        loading={studentsQuery.isLoading}
      />

      <DashboardPanel
        title="Directory Controls"
        description="Search, filter, export, and switch between active and archived students."
      >
        <StudentToolbar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          classOptions={classOptions}
          resultCount={filteredStudents.length}
          totalCount={directoryStudents.length}
          onAddStudent={openCreateForm}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          disabled={listLoading}
        />
      </DashboardPanel>

      {listLoading ? (
        <DashboardPanel
          title={viewMode === "archived" ? "Archived Students" : "Student Directory"}
          description="Loading records…"
        >
          <StudentTableSkeleton rows={6} />
        </DashboardPanel>
      ) : listError ? (
        <EmptyState
          icon={GraduationCap}
          title="Students unavailable"
          description={listError}
          actionLabel="Retry"
          onAction={() =>
            viewMode === "archived"
              ? archivedQuery.refetch()
              : studentsQuery.refetch()
          }
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          mode={viewMode}
          onView={handleView}
          onEdit={handleEditFromRow}
          onDelete={handleDeleteRequest}
          onRestore={handleRestore}
        />
      )}

      <StudentProfile
        open={profileOpen}
        studentId={profileStudentId}
        onClose={() => {
          setProfileOpen(false);
          setProfileStudentId(null);
        }}
        onEdit={(detail) => openEditForm(detail)}
      />

      <StudentRegistrationForm
        open={formOpen}
        mode={formMode}
        student={formMode === "edit" ? editingStudent : null}
        onClose={() => {
          if (formLoading) return;
          setFormOpen(false);
          setEditingStudent(null);
          setFormMode("create");
        }}
        onSuccess={handleFormSuccess}
        classOptions={classOptions}
        classesLoading={classesQuery.isLoading || formLoading}
        classesError={classesError}
      />

      <StudentDeleteDialog
        open={Boolean(deleteTarget)}
        student={deleteTarget}
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
