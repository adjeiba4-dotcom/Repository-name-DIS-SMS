/**
 * Shared constants for the Teachers workspace filters/stats.
 * Live directory data comes from the Teachers API.
 */

export const TEACHER_STATUSES = ["Active", "Inactive", "Archived"];

export function getTeacherStats(teachers = []) {
  const total = teachers.length;
  const active = teachers.filter((t) => t.status === "Active").length;
  const inactive = teachers.filter((t) => t.status === "Inactive").length;
  const archived = teachers.filter((t) => t.status === "Archived").length;

  return { total, active, inactive, archived };
}
