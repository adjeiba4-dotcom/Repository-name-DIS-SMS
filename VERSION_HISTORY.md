# DIS-SMS Version History

> Milestone log for the DIS-SMS platform.  
> Versions below are product milestones (not necessarily npm package versions).

---

## Versioning scheme

| Field | Meaning |
|-------|---------|
| Major | Breaking platform / architecture shift |
| Minor | Feature module or sprint train |
| Patch | Polish, docs, fixes within a train |

Current milestone: **v0.7.7** (Sprint 7.7 — Student Promotion & Graduation)

---

## v0.7.7 — Sprint 7.7 · Student Promotion & Graduation (2026-08-06)

### Added
- **Student Promotion & Graduation** full stack (Repository → Service → Controller → Validator → Routes)
- Configurable decisions: **Promoted**, **Promoted on Probation**, **Repeat**, **Graduated**, **Withdrawn**, **Transferred**
- Recommendations generated from **published/locked Report Cards** (with average-based auto-decision fallback via platform thresholds)
- Workflow: **Draft (Preview) → Approved → Executed** with cancel / unapprove (Administrator) reverse paths
- Bulk approve / execute / cancel; soft archive / restore; per-student promotion history; graduates directory
- On execute: continuation decisions create next-year **Enrollment** + update `student.classId`; exit decisions set `student.status = INACTIVE` (history preserved)
- Duplicate promotion blocked per student × from academic year; destination class capacity checks
- Overview / class statistics, audit logging, Swagger docs, role-name RBAC
- Frontend Promotions workspace (directory, graduates, analytics, archive, recommend/edit drawers, bulk actions, Excel/CSV/PDF/print)
- Permission stubs: `promotions.view|create|update|delete|recommend|approve|execute`
- Platform config: `academic.promotion_pass_average`, `academic.probation_pass_average`

### Schema
- `StudentPromotion` model with workflow, decision, destination year/class, report-card link, resulting enrollment
- Enum `PromotionWorkflowStatus` (`DRAFT`, `APPROVED`, `EXECUTED`, `CANCELLED`)
- Expanded `PromotionDecision` (migrates legacy `CONDITIONAL` → `PROMOTED_ON_PROBATION`, `DEFERRED` → `PENDING`)
- Migration `20260806120000_student_promotions`

### Hardening
- Unique `studentId + fromAcademicYearId`; revive/regenerate drafts without colliding with executed records
- Executed promotions immutable for non-admins; destination class must belong to destination academic year
- Report Cards / templates / validators aligned to the expanded promotion decision vocabulary

### Notes
- Legacy promotion scaffold rewritten end-to-end against the new Prisma model
- Class-code matching suggests destination classes for REPEAT / continuation when next-year classes exist
---

## v0.7.6 — Sprint 7.6 · Report Cards (2026-08-06)

### Added
- **Report Cards Engine** full stack (Repository → Service → Controller → Validator → Routes)
- Generate official academic snapshots **only from published/locked Results**
- Snapshot freezes school branding, student identity, subject results, positions, grades, averages, attendance summary, remarks, and promotion decision
- Workflow: **Draft → Generated → Verified → Published → Locked** with RBAC per stage (aligned with Results)
- Single-student and **bulk class** generation for enrolled students
- Preview render model (`GET /:id/preview`) via extensible **template registry** (`STANDARD_A4` today)
- Soft archive/restore, search, pagination, overview/class statistics, audit logging, Swagger docs
- Frontend Report Cards workspace (directory, analytics, archive, generate drawers, A4 preview, remarks editor)
- Professional **A4 PDF** (jsPDF) and print layout with school logo, student photo placeholder, subject table, attendance, remarks, signature blocks, Ocean Blue branding
- Directory Excel/CSV/PDF/print exports
- **Student Profile** integration — recent report cards with preview, PDF, and print actions
- Permission stubs: `report-cards.view|create|update|delete|generate|verify|publish|lock`

### Schema
- `ReportCard` model with JSON `snapshot`, workflow flags, promotion decision, attendance denorm fields
- Enums: `ReportCardWorkflowStatus`, `PromotionDecision`
- Migration `20260806100000_report_cards`

### Hardening
- Soft-delete revive on regenerate (avoids unique-key collisions after archive)
- Published/locked cards immutable for non-admins (update, refresh, archive, regenerate)
- Workflow reverse transitions require unlock → unpublish → unverify (Results Engine parity)
- Overall grade resolution uses default GradeScale + lowest-band fallback
- List API omits heavy `snapshot` JSON; detail/preview retain full payload

### Notes
- Legacy scaffold rewritten end-to-end (no longer references non-existent Prisma fields)
- Future templates register under `backend/services/reportCardTemplates/` without changing the snapshot contract
- PDF/print/Excel/CSV are client-side via preview render model (same pattern as Results)
---

## v0.7.5.1 — Results Engine completion polish (2026-08-06)

### Added
- **Grade Scales API** (`/api/grades`, `/api/grades/scales`) — CRUD for configurable grade bands without code changes
- Settings **Grading Scales** tab with band editor (letter, range, remark, pass flag, default scale)
- Student multi-subject **Result Profile** drawer (from directory, broadsheet, merit list) with Excel/CSV/PDF/print
- Generate options: **asDraft** workflow start + optional CA/Exam weight overrides
- Recalculate positions action; role-gated Generate / Verify / Publish / Lock UI

### Fixed
- Duplicate `WORKFLOW_VALUES` in result validator (module load SyntaxError)
- Lock workflow no longer overwrites original publish timestamps
- Pass/fail now respects both System Settings pass mark and grade-band `isPass`
- Platform Config validates CA + Exam weights sum to 100%
- Analytics skeletons / StatCard overview aligned with Assessment patterns

---

## v0.7.5 — Sprint 7.5 · Results Engine (2026-08-05)

### Added
- **Results Engine** full stack (Repository → Service → Controller → Validator → Routes)
- Composite result generation: Continuous Assessment + locked Examination scores
- Configurable weightings via System Settings (`academic.ca_weight` 40, `academic.exam_weight` 60, `academic.pass_mark` 50)
- Final score, grade band, remark, subject/class position, averages, pass/fail
- Workflow: **Draft → Generated → Verified → Published → Locked** with RBAC per stage
- Verify / unverify APIs (Headmaster/Registrar/Administrator verify; Administrator unverify)
- Class broadsheet, merit list, and student result profile APIs
- Publication, locking, soft archive/restore, regenerate with duplicate guards
- Analytics scopes: overview / class / subject / student / grade
- GradeScale ↔ Grade linkage with auto-seeded Standard Percentage bands
- Frontend Results workspace (directory, broadsheet, merit list, generate drawer, profile, analytics, archive)
- Exports: Excel, CSV, PDF, and print
- Swagger docs, audit logging, role-name RBAC aligned with Examinations

### Schema
- Reshaped `Result` for term/class/subject/student composite results
- Soft archive (`deletedAt` / `status`), publish & lock fields
- `ResultWorkflowStatus` + `workflowStatus` / `isVerified` / `verifiedAt` / `verifiedById`
- Migration `20260805200000_result_engine`
- Migration `20260805210000_result_workflow_views`

### Notes
- Source examinations must be locked before generation
- Only enrolled students with both CA and exam scores are included
- Weights/grades configurable via System Settings and GradeScale (not hardcoded in UI)

---

## v0.6.8 — Sprint 6.8 · Platform Foundation & Architecture Freeze (2026-08-05)

### Added
- **School Settings** module (backend + frontend): institutional profile with logo upload
- **Global Configuration** service on `SystemSetting` (currency, date/time, pagination, academic defaults)
- **Audit Trail** reusable service + paginated `/api/audits` API (entity diffs, actor, IP)
- **File Upload** shared service (`multer`) for logos/photos/documents at `/api/uploads`
- **Notification** framework with IN_APP delivery and EMAIL/SMS channel readiness
- Prisma models: `SchoolProfile`, `FileAsset`; extended `AuditLog`, `SystemSetting`, `Notification`
- Settings UI tabs: School Profile, Platform Config, Audit Trail, Notifications

### Notes
- Prepares Architecture Freeze before operational modules (Timetable, Attendance, Results)
- Existing academic/finance business logic unchanged except shared-service integration points
- Runtime RBAC remains role-name based; permission stubs extended for future enforcement

---



### Added
- Root documentation: `PROJECT_ROADMAP.md`, `ARCHITECTURE_GUIDE.md`, `CODING_STANDARDS.md`, `VERSION_HISTORY.md`
- Project standardization review (findings recorded in Sprint 3.5 report)

### Notes
- No new ERP modules in this sprint
- Students remains the reference feature module
- AppShell plug-in rules frozen for Sprint 4+

---

## v0.3.4 — Sprint 3 Batch 5 · Students Production Polish (2026-08-03)

### Added
- Reusable Toast system (`components/ui/Toast.jsx`)
- Loading skeletons (stats, table, profile)
- Student table pagination, sorting, rows-per-page, “Showing X–Y of Z”
- Excel and PDF export
- Archived Students view + restore action
- Silent JWT refresh via `/api/auth/refresh-token`
- Avatar photo support with initials fallback

### Dependencies
- `xlsx`, `jspdf`, `jspdf-autotable`

---

## v0.3.3 — Sprint 3 Batch 4 · Profile, Edit & Delete (2026-08-03)

### Added
- Student Profile drawer (`GET /api/students/:id`)
- Edit mode on registration drawer (`PUT` student + guardian)
- Archive confirmation dialog (`DELETE` soft-delete)
- Session-expired login messaging (`/login?reason=session-expired`)

### Fixed
- Student repository `schoolClass` select uses Prisma `name` / `code`
- Guardian nested select includes `email`, `occupation` for edit forms
- Auth payload unwrap for nested `ApiResponse.data`

---

## v0.3.2 — Sprint 3 Batch 3 · Student API Integration (2026-08-03)

### Added
- Frontend student / guardian / class services
- Live list + create (guardian then student)
- Query-driven directory refresh after create
- Loading and error handling for Students page

### Fixed
- Class repository student select `admissionNo`
- Guardian select removes non-schema `alternatePhone` field from selects

---

## v0.3.1 — Sprint 3 Batch 2 · Registration Drawer (2026-08-03)

### Added
- Shared `Drawer` UI component
- Multi-section Student Registration form (personal, academic, guardian, contact, medical, photo UI)
- Client-side validation-ready fields
- Add Student opens right-side drawer over directory

---

## v0.3.0 — Sprint 3 Batch 1 · Students Workspace (2026-08-03)

### Added
- `features/students` foundation (page, stats, toolbar, table, sample data)
- Route registration for Students via `PAGE_REGISTRY`
- Shared dashboard widgets reused on Students

---

## v0.2.x — Sprint 2 · Enterprise UI & Shared Dashboard Components

### Added
- Enterprise UI polish (Sidebar, Header, Dashboard spacing/typography)
- Shared dashboard components: `SectionHeader`, `StatCard`, `DashboardPanel`, `EmptyState`
- Dashboard 2.0 composition consuming shared widgets

---

## v0.1.x — Sprint 1 / Foundation

### Added
- Backend layered architecture (auth, RBAC, domain routes)
- Prisma schema and migrations foundation
- Frontend AppShell, design tokens, UI kit
- Auth login flow
- Module placeholder routing for unused nav items

---

## Upcoming (planned)

| Milestone | Focus |
|-----------|--------|
| v0.4.0 | Teachers module (Sprint 4) |
| v0.5.0 | Classes & Academic Years |
| v0.6.0 | Attendance |
| v1.0.0 | Production-ready core (academics + finance + system admin) |

See [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) for the full plan.

---

## Compatibility notes

- Frontend expects API base `http://localhost:5000/api` (configurable in `frontend/src/constants/api.js`)
- Student routes currently require Administrator role
- Soft-deleted students are excluded from the active list and available under archived endpoints
