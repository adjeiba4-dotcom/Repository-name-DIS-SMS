/**
 * Report Cards API smoke checklist (manual / future automation).
 *
 * Endpoints under /api/report-cards:
 * - GET    /                         paginated directory + filters
 * - GET    /archived                 soft-archived report cards
 * - GET    /stats                    overview / class analytics
 * - GET    /templates                configurable template registry
 * - POST   /generate                 single student from published results
 * - POST   /generate-bulk            entire class
 * - POST   /verify                   GENERATED → VERIFIED
 * - POST   /unverify                 VERIFIED → GENERATED (Administrator)
 * - POST   /publish                  VERIFIED → PUBLISHED
 * - POST   /unpublish                PUBLISHED → VERIFIED (Administrator)
 * - POST   /lock                     PUBLISHED → LOCKED
 * - POST   /unlock                   LOCKED → PUBLISHED (Administrator)
 * - GET    /:id                      detail + snapshot
 * - GET    /:id/preview              A4 render model for PDF/print
 * - PUT    /:id                      remarks / promotion / refreshSnapshot
 * - DELETE /:id                      soft archive
 * - PATCH  /:id/restore              restore archived card
 *
 * Workflow: Draft → Generated → Verified → Published → Locked
 *
 * Business rules:
 * - Generate only from published or locked Results
 * - Snapshot freezes school branding, subjects, attendance, positions, grades
 * - Unique per student × academic year × term
 * - Bulk generation for enrolled class students
 * - templateKey supports future layouts (STANDARD_A4 today)
 */

console.log(
  "Report Cards API surface documented. Wire automated tests when HTTP harness is ready."
);
