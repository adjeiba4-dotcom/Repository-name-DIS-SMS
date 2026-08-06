/**
 * Assessment API smoke checklist (manual / future automation).
 *
 * Endpoints under /api/assessments:
 * - GET    /                      paginated directory + filters
 * - GET    /archived              soft-archived assessments
 * - GET    /stats                 overview/class/subject/teacher/type/student analytics
 * - GET    /:id                   detail with scores
 * - GET    /:id/roster            enrolled students + score sheet
 * - POST   /                      create assessment
 * - PUT    /:id                   update assessment
 * - DELETE /:id                   soft archive
 * - PATCH  /:id/restore           restore archived assessment
 * - POST   /:id/scores/bulk       UPSERT or CLEAR student scores
 *
 * Business rules:
 * - Teacher must be assigned via TeacherSubject / ClassSubject
 * - Assessment date within academic year and term
 * - Unique class + subject + type + date
 * - Scores cannot be negative or exceed maxMarks
 * - Only enrolled students may receive scores
 */

console.log(
  "Assessment API surface documented. Wire automated tests when HTTP harness is ready."
);
