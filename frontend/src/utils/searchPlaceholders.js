import { findNavigationItemByPath } from "./navigation";

/**
 * Contextual search placeholders by route — UI guidance only.
 */
const SEARCH_PLACEHOLDERS = {
  "/": "Search modules, students, or records…",
  "/students": "Search students by name or ID…",
  "/teachers": "Search teachers by name or staff ID…",
  "/guardians": "Search guardians by name or phone…",
  "/departments": "Search departments by name or code…",
  "/subjects": "Search subjects by name or code…",
  "/classes": "Search classes by name or stream…",
  "/enrollments": "Search enrollments by student or class…",
  "/attendance": "Search attendance by class or date…",
  "/assessments": "Search assessments by class, subject, or type…",
  "/examinations": "Search examinations by class, subject, or type…",
  "/results": "Search results by student, subject, class, or grade…",
  "/finance": "Search invoices, fees, or payments…",
  "/reports": "Search reports by name…",
  "/settings": "Search settings…",
};

const DEFAULT_PLACEHOLDER = "Search DIS-SMS…";

/**
 * Resolve a contextual search placeholder for the current pathname.
 */
export function getSearchPlaceholder(pathname = "/") {
  const exact = SEARCH_PLACEHOLDERS[pathname];
  if (exact) return exact;

  const navItem = findNavigationItemByPath(pathname);
  if (navItem?.path && SEARCH_PLACEHOLDERS[navItem.path]) {
    return SEARCH_PLACEHOLDERS[navItem.path];
  }

  if (navItem?.label) {
    return `Search ${navItem.label.toLowerCase()}…`;
  }

  return DEFAULT_PLACEHOLDER;
}

export { SEARCH_PLACEHOLDERS };
