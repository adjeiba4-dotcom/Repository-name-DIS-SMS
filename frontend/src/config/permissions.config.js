/**
 * Permission key stubs for future RBAC enforcement.
 * Not wired to routes or UI in Batch 1.
 */

const permissionsConfig = {
  roles: {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    TEACHER: "TEACHER",
    ACCOUNTANT: "ACCOUNTANT",
    STUDENT: "STUDENT",
    GUARDIAN: "GUARDIAN",
  },
  permissions: {
    DASHBOARD_VIEW: "dashboard.view",
    STUDENTS_VIEW: "students.view",
    STUDENTS_CREATE: "students.create",
    STUDENTS_UPDATE: "students.update",
    STUDENTS_DELETE: "students.delete",
    TEACHERS_VIEW: "teachers.view",
    SUBJECTS_VIEW: "subjects.view",
    SUBJECTS_CREATE: "subjects.create",
    SUBJECTS_UPDATE: "subjects.update",
    SUBJECTS_DELETE: "subjects.delete",
    TEACHER_SUBJECTS_VIEW: "teacher-subjects.view",
    TEACHER_SUBJECTS_CREATE: "teacher-subjects.create",
    TEACHER_SUBJECTS_UPDATE: "teacher-subjects.update",
    TEACHER_SUBJECTS_DELETE: "teacher-subjects.delete",
    CLASS_SUBJECTS_VIEW: "class-subjects.view",
    CLASS_SUBJECTS_CREATE: "class-subjects.create",
    CLASS_SUBJECTS_UPDATE: "class-subjects.update",
    CLASS_SUBJECTS_DELETE: "class-subjects.delete",
    ENROLLMENTS_VIEW: "enrollments.view",
    ENROLLMENTS_CREATE: "enrollments.create",
    ENROLLMENTS_UPDATE: "enrollments.update",
    ENROLLMENTS_DELETE: "enrollments.delete",
    CLASSES_VIEW: "classes.view",
    FINANCE_VIEW: "finance.view",
    REPORTS_VIEW: "reports.view",
    SETTINGS_MANAGE: "settings.manage",
    USERS_MANAGE: "users.manage",
    ROLES_MANAGE: "roles.manage",
  },
};

export default permissionsConfig;
