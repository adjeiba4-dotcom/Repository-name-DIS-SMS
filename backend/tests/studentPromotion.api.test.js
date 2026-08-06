/**
 * Student Promotion & Graduation API smoke checklist (manual / future automation).
 *
 * Endpoints under /api/student-promotions:
 * - GET    /                         paginated directory + filters
 * - GET    /archived                 soft-archived promotions
 * - GET    /graduates                graduated students filter
 * - GET    /stats                    overview / class analytics
 * - GET    /history/:studentId       per-student promotion history
 * - POST   /recommend                draft recommendations from published report cards
 * - POST   /approve                  DRAFT → APPROVED (bulk)
 * - POST   /unapprove                APPROVED → DRAFT (Administrator)
 * - POST   /execute                  APPROVED → EXECUTED (enroll / exit)
 * - POST   /cancel                   cancel DRAFT/APPROVED
 * - GET    /:id                      detail
 * - PUT    /:id                      decision / destination / remarks
 * - DELETE /:id                      soft archive
 * - PATCH  /:id/restore              restore archived
 *
 * Workflow: Draft (Preview) → Approved → Executed
 *
 * Decisions: PROMOTED | PROMOTED_ON_PROBATION | REPEAT | GRADUATED | WITHDRAWN | TRANSFERRED
 *
 * Business rules:
 * - Recommendations require published/locked Report Cards
 * - Unique per student × from academic year
 * - Continuation decisions create next-year Enrollment and update student.classId
 * - Exit decisions set student.status = INACTIVE (history preserved)
 * - Duplicate promotions blocked; capacity checked on destination class
 */

console.log(
  "Student Promotions API surface documented. Wire automated tests when HTTP harness is ready."
);
