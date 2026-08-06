import Dashboard from "../pages/dashboard/Dashboard";
import Students from "../pages/students/Students";
import Teachers from "../pages/teachers/Teachers";
import Guardians from "../pages/guardians/Guardians";
import Departments from "../pages/departments/Departments";
import Classes from "../pages/classes/Classes";
import Subjects from "../pages/subjects/Subjects";
import TeacherSubjects from "../pages/teacher-subjects/TeacherSubjects";
import ClassSubjects from "../pages/class-subjects/ClassSubjects";
import Timetables from "../pages/timetables/Timetables";
import Attendance from "../pages/attendance/Attendance";
import Assessments from "../pages/assessments/Assessments";
import Examinations from "../pages/examinations/Examinations";
import Results from "../pages/results/Results";
import ReportCards from "../pages/report-cards/ReportCards";
import Promotions from "../pages/promotions/Promotions";
import Enrollments from "../pages/enrollments/Enrollments";
import AcademicYears from "../pages/academic-years/AcademicYears";
import Terms from "../pages/terms/Terms";
import Settings from "../pages/settings/Settings";
import ModulePlaceholder from "../pages/common/ModulePlaceholder";
import {
  getNavigationItems,
  toRoutePath,
} from "../utils/navigation";

/**
 * Page registry for shell routes.
 * Future modules register a real page component here (or via feature route modules).
 * AppShell is never modified when adding modules.
 */
const PAGE_REGISTRY = {
  dashboard: Dashboard,
  students: Students,
  teachers: Teachers,
  guardians: Guardians,
  departments: Departments,
  classes: Classes,
  subjects: Subjects,
  "teacher-subjects": TeacherSubjects,
  "class-subjects": ClassSubjects,
  timetables: Timetables,
  attendance: Attendance,
  assessments: Assessments,
  examinations: Examinations,
  results: Results,
  "report-cards": ReportCards,
  promotions: Promotions,
  enrollments: Enrollments,
  "academic-years": AcademicYears,
  terms: Terms,
  settings: Settings,
};

/**
 * Build nested child routes from navigation.config.js.
 * `roles` on nav items are placeholders only — not enforced.
 */
export function buildAppRoutes() {
  return getNavigationItems().map((item) => {
    const Page = PAGE_REGISTRY[item.id] ?? ModulePlaceholder;
    const routePath = toRoutePath(item.path);

    return {
      id: item.id,
      index: routePath === null,
      path: routePath ?? undefined,
      element: <Page navItem={item} />,
    };
  });
}
