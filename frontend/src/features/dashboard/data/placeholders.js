/**
 * Static placeholder content for Dashboard 2.0 foundation.
 * No API or live chart data — replace in a later data-wiring batch.
 */

export const KPI_PLACEHOLDERS = [
  {
    id: "students",
    label: "Total Students",
    value: "—",
    hint: "Enrollment snapshot",
    trend: "Pending data",
    tone: "brand",
  },
  {
    id: "attendance",
    label: "Attendance Today",
    value: "—",
    hint: "Present / expected",
    trend: "Pending data",
    tone: "success",
  },
  {
    id: "fees",
    label: "Fees Collected",
    value: "—",
    hint: "Month to date",
    trend: "Pending data",
    tone: "warning",
  },
  {
    id: "staff",
    label: "Active Staff",
    value: "—",
    hint: "Teachers & admins",
    trend: "Pending data",
    tone: "info",
  },
];

export const ANALYTICS_PLACEHOLDERS = [
  {
    id: "enrollment-trend",
    title: "Enrollment Trend",
    description: "Student enrollment over the current term.",
    caption: "Chart placeholder — live analytics in a later batch",
  },
  {
    id: "attendance-overview",
    title: "Attendance Overview",
    description: "Daily attendance rate across classes.",
    caption: "Chart placeholder — live analytics in a later batch",
  },
];

export const QUICK_ACTIONS = [
  {
    id: "add-student",
    label: "Add Student",
    description: "Register a new learner",
    path: "/students",
  },
  {
    id: "mark-attendance",
    label: "Mark Attendance",
    description: "Record today’s attendance",
    path: "/attendance",
  },
  {
    id: "collect-fees",
    label: "Collect Fees",
    description: "Log a fee payment",
    path: "/finance",
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Open reporting suite",
    path: "/reports",
  },
];

export const RECENT_ACTIVITY = [
  {
    id: "a1",
    title: "System ready",
    detail: "Dashboard 2.0 foundation is available.",
    time: "Just now",
    tone: "info",
  },
  {
    id: "a2",
    title: "No activity yet",
    detail: "Recent actions will appear here once modules are live.",
    time: "—",
    tone: "secondary",
  },
  {
    id: "a3",
    title: "Awaiting module events",
    detail: "Students, attendance, and finance will feed this feed.",
    time: "—",
    tone: "secondary",
  },
];

export const ANNOUNCEMENTS = [
  {
    id: "n1",
    title: "Welcome to DIS-SMS",
    body: "Executive overview widgets are scaffolding in place. Live school metrics will connect in upcoming sprints.",
    tag: "Product",
    tone: "primary",
  },
  {
    id: "n2",
    title: "Data wiring next",
    body: "KPI cards and charts will bind to API summaries without changing this layout shell.",
    tag: "Roadmap",
    tone: "info",
  },
];
