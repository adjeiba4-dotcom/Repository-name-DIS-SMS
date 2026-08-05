import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  BookUser,
  School,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  BarChart3,
  Wallet,
  Library,
  Package,
  FileBarChart2,
  Settings,
  Shield,
  UserCog,
} from "lucide-react";

/**
 * Sidebar navigation configuration — single source of truth for AppShell nav.
 * Shape: { id, label, icon, path, roles, enabled }
 *
 * `roles` is a placeholder for future RBAC only. Do not filter or enforce here.
 * Adding a module: append an item (and register a page in routes/app.routes.jsx).
 * AppShell itself must not be modified for new modules.
 */

const navigationConfig = [
  {
    title: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
        roles: [],
        enabled: true,
      },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      {
        id: "students",
        label: "Students",
        icon: GraduationCap,
        path: "/students",
        roles: [],
        enabled: true,
      },
      {
        id: "teachers",
        label: "Teachers",
        icon: Users,
        path: "/teachers",
        roles: [],
        enabled: true,
      },
      {
        id: "guardians",
        label: "Guardians",
        icon: Shield,
        path: "/guardians",
        roles: [],
        enabled: true,
      },
      {
        id: "departments",
        label: "Departments",
        icon: Building2,
        path: "/departments",
        roles: [],
        enabled: true,
      },
      {
        id: "subjects",
        label: "Subjects",
        icon: BookOpen,
        path: "/subjects",
        roles: [],
        enabled: true,
      },
      {
        id: "teacher-subjects",
        label: "Teacher Subjects",
        icon: BookUser,
        path: "/teacher-subjects",
        roles: [],
        enabled: true,
      },
      {
        id: "classes",
        label: "Classes",
        icon: School,
        path: "/classes",
        roles: [],
        enabled: true,
      },
      {
        id: "academic-years",
        label: "Academic Years",
        icon: CalendarDays,
        path: "/academic-years",
        roles: [],
        enabled: true,
      },
      {
        id: "terms",
        label: "Terms",
        icon: CalendarRange,
        path: "/terms",
        roles: [],
        enabled: true,
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: ClipboardCheck,
        path: "/attendance",
        roles: [],
        enabled: true,
      },
      {
        id: "results",
        label: "Results",
        icon: BarChart3,
        path: "/results",
        roles: [],
        enabled: true,
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        id: "finance",
        label: "Finance",
        icon: Wallet,
        path: "/finance",
        roles: [],
        enabled: true,
      },
      {
        id: "library",
        label: "Library",
        icon: Library,
        path: "/library",
        roles: [],
        enabled: true,
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: Package,
        path: "/inventory",
        roles: [],
        enabled: true,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: FileBarChart2,
        path: "/reports",
        roles: [],
        enabled: true,
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        path: "/settings",
        roles: [],
        enabled: true,
      },
      {
        id: "users",
        label: "Users",
        icon: UserCog,
        path: "/users",
        roles: [],
        enabled: true,
      },
      {
        id: "roles",
        label: "Roles",
        icon: Shield,
        path: "/roles",
        roles: [],
        enabled: true,
      },
    ],
  },
];

export default navigationConfig;
