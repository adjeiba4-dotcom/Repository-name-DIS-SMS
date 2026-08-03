/**
 * Shared constants for the Students workspace filters/stats.
 * Live directory data comes from the Students API.
 */

export const STUDENT_STATUSES = ["Active", "Inactive", "Archived"];

export function getStudentStats(students = []) {
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const inactive = students.filter((s) => s.status === "Inactive").length;
  const archived = students.filter((s) => s.status === "Archived").length;

  return { total, active, inactive, archived };
}
