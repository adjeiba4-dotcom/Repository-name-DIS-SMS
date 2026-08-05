import Dashboard from "../pages/dashboard/Dashboard";
import Students from "../pages/students/Students";
import Teachers from "../pages/teachers/Teachers";
import Guardians from "../pages/guardians/Guardians";
import Classes from "../pages/classes/Classes";
import Subjects from "../pages/subjects/Subjects";
import TeacherSubjects from "../pages/teacher-subjects/TeacherSubjects";
import ClassSubjects from "../pages/class-subjects/ClassSubjects";
import Enrollments from "../pages/enrollments/Enrollments";
import AcademicYears from "../pages/academic-years/AcademicYears";
import Terms from "../pages/terms/Terms";
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
  classes: Classes,
  subjects: Subjects,
  "teacher-subjects": TeacherSubjects,
  "class-subjects": ClassSubjects,
  enrollments: Enrollments,
  "academic-years": AcademicYears,
  terms: Terms,
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
