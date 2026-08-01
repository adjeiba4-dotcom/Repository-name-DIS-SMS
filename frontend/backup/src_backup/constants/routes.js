// src/constants/routes.js

/**
 * Application Route Constants
 */

export const ROUTES = {
    // Authentication
    LOGIN: "/login",
    LOGOUT: "/logout",

    // Dashboard
    DASHBOARD: "/",

    // Academic
    STUDENTS: "/students",
    STUDENT_DETAILS: "/students/:id",

    GUARDIANS: "/guardians",

    TEACHERS: "/teachers",

    SUBJECTS: "/subjects",

    CLASSES: "/classes",

    ACADEMIC_YEARS: "/academic-years",

    TERMS: "/terms",

    TIMETABLES: "/timetables",

    ATTENDANCE: "/attendance",

    EXAMINATIONS: "/examinations",

    RESULTS: "/results",

    REPORT_CARDS: "/report-cards",

    STUDENT_PROMOTIONS: "/student-promotions",

    // Finance
    FEE_TYPES: "/fee-types",

    FEE_STRUCTURES: "/fee-structures",

    STUDENT_INVOICES: "/student-invoices",

    PAYMENTS: "/payments",

    PAYMENT_ALLOCATIONS: "/payment-allocations",

    RECEIPTS: "/receipts",

    // Communication
    ANNOUNCEMENTS: "/announcements",

    NOTIFICATIONS: "/notifications",

    EVENTS: "/events",

    // Dashboard Management
    DASHBOARDS: "/dashboards",

    DASHBOARD_WIDGETS: "/dashboard-widgets",

    // Settings
    SETTINGS: "/settings",

    // Reports
    REPORTS: "/reports",

    // Administration
    USERS: "/users",

    ROLES: "/roles",

    AUDIT_LOGS: "/audits",

    // Fallback
    NOT_FOUND: "*",
};

export default ROUTES;