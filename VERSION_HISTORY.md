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

Current milestone: **v0.3.5** (Sprint 3.5 — Architecture Freeze & Standardization)

---

## v0.3.5 — Sprint 3.5 · Architecture Freeze (2026-08-03)

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
