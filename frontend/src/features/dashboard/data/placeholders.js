/**
 * Static placeholder content for the executive dashboard.
 * No API or live chart data — replace in a later data-wiring batch.
 */

export const KPI_PLACEHOLDERS = [
  {
    id: "students",
    label: "Total Students",
    value: "1,248",
    hint: "Active enrollments",
    trend: "+4.2%",
    tone: "ocean",
  },
  {
    id: "teachers",
    label: "Active Teachers",
    value: "86",
    hint: "Faculty on roster",
    trend: "+2",
    tone: "cyan",
  },
  {
    id: "guardians",
    label: "Guardians",
    value: "972",
    hint: "Linked contacts",
    trend: "Stable",
    tone: "lime",
  },
  {
    id: "classes",
    label: "Active Classes",
    value: "42",
    hint: "Current term",
    trend: "8 streams",
    tone: "yellow",
  },
  {
    id: "attendance",
    label: "Attendance Today",
    value: "94.6%",
    hint: "Present / expected",
    trend: "+1.1%",
    tone: "ocean",
  },
  {
    id: "fees",
    label: "Fees Collected",
    value: "$128K",
    hint: "Month to date",
    trend: "72% of target",
    tone: "yellow",
  },
  {
    id: "enrollments",
    label: "Pending Enrollments",
    value: "37",
    hint: "Awaiting approval",
    trend: "Review",
    tone: "red",
  },
  {
    id: "subjects",
    label: "Subjects Offered",
    value: "64",
    hint: "Across departments",
    trend: "Catalog",
    tone: "cyan",
  },
];

export const ACADEMIC_SUMMARY = [
  {
    id: "year",
    label: "Academic Year",
    value: "2025 / 2026",
    detail: "In progress · Term 2",
    tone: "ocean",
  },
  {
    id: "term",
    label: "Current Term",
    value: "Term 2",
    detail: "Ends 18 Dec 2026",
    tone: "cyan",
  },
  {
    id: "departments",
    label: "Departments",
    value: "12",
    detail: "Academic units",
    tone: "lime",
  },
  {
    id: "completion",
    label: "Syllabus Progress",
    value: "61%",
    detail: "Average across classes",
    tone: "yellow",
  },
];

export const ANALYTICS_PLACEHOLDERS = [
  {
    id: "enrollment-trend",
    title: "Enrollment Trend",
    description: "Student enrollment over the current academic year.",
    caption: "Chart placeholder — live analytics will bind here",
    type: "chart",
  },
  {
    id: "attendance-overview",
    title: "Attendance Overview",
    description: "Daily attendance rate across classes.",
    caption: "Chart placeholder — live analytics will bind here",
    type: "chart",
  },
  {
    id: "academic-calendar",
    title: "Academic Calendar",
    description: "Upcoming terms, exams, and school events.",
    caption: "Calendar widget placeholder — events wiring later",
    type: "calendar",
  },
];

export const QUICK_ACTIONS = [
  {
    id: "add-student",
    label: "Add Student",
    description: "Register a new learner",
    path: "/students",
    tone: "ocean",
  },
  {
    id: "add-teacher",
    label: "Add Teacher",
    description: "Onboard faculty staff",
    path: "/teachers",
    tone: "cyan",
  },
  {
    id: "mark-attendance",
    label: "Mark Attendance",
    description: "Record today’s attendance",
    path: "/attendance",
    tone: "lime",
  },
  {
    id: "collect-fees",
    label: "Collect Fees",
    description: "Log a fee payment",
    path: "/finance",
    tone: "yellow",
  },
  {
    id: "new-enrollment",
    label: "New Enrollment",
    description: "Start an enrollment request",
    path: "/enrollments",
    tone: "red",
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Open reporting suite",
    path: "/reports",
    tone: "ocean",
  },
];

export const RECENT_ACTIVITY = [
  {
    id: "a1",
    title: "Enrollment submitted",
    detail: "Pending review for Grade 8 — Science stream.",
    time: "12 min ago",
    tone: "ocean",
  },
  {
    id: "a2",
    title: "Attendance posted",
    detail: "Form 3B marked complete for today.",
    time: "45 min ago",
    tone: "lime",
  },
  {
    id: "a3",
    title: "Fee payment recorded",
    detail: "Invoice #INV-2041 partially settled.",
    time: "2 hrs ago",
    tone: "yellow",
  },
  {
    id: "a4",
    title: "Teacher subject assigned",
    detail: "Ms. Okello linked to Chemistry — Term 2.",
    time: "Yesterday",
    tone: "cyan",
  },
  {
    id: "a5",
    title: "Guardian profile updated",
    detail: "Contact details refreshed for student STU-1182.",
    time: "Yesterday",
    tone: "red",
  },
];

export const ANNOUNCEMENTS = [
  {
    id: "n1",
    title: "Term 2 mid-term exams",
    body: "Assessment window opens next week. Ensure class lists and subject allocations are current.",
    tag: "Academics",
    tone: "ocean",
  },
  {
    id: "n2",
    title: "Fee reminder cycle",
    body: "Automated guardian reminders will run Friday. Review outstanding balances beforehand.",
    tag: "Finance",
    tone: "yellow",
  },
  {
    id: "n3",
    title: "System health",
    body: "Executive dashboard widgets are scaffolded with placeholder metrics until live APIs connect.",
    tag: "Platform",
    tone: "cyan",
  },
];

export const CALENDAR_DAYS = [
  { day: "Mon", date: 3, events: 1 },
  { day: "Tue", date: 4, events: 0 },
  { day: "Wed", date: 5, events: 2 },
  { day: "Thu", date: 6, events: 1 },
  { day: "Fri", date: 7, events: 3 },
  { day: "Sat", date: 8, events: 0 },
  { day: "Sun", date: 9, events: 0 },
];
