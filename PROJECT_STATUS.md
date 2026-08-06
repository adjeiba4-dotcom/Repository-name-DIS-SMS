# DIS-SMS Project Status

> **Living document** — update after every sprint.  
> Source of truth: current codebase, Prisma schema, Git tags/commits, and `VERSION_HISTORY.md`.  
> Last reviewed: **2026-08-06** (Sprint 7.6 Report Cards)

---

## Project Overview

| Field | Value |
|-------|--------|
| **Project Name** | Data Insight School Management System (**DIS-SMS**) |
| **Product Type** | Full-stack school ERP (Academics, Finance, Operations, Communication) |
| **Current Version** | **v1.0.0-rc.1** — Academic Core completed *(release commit; tag pending)* |
| **Latest Git Tag** | **v1.0.0-beta.2** — Class Subject Allocation |
| **Platform Milestone** | **v0.6.8** — Sprint 6.8 · Platform Foundation & Architecture Freeze |
| **Development Stage** | Phase 2 — Academic Operations (core academic modules delivered; ops modules next) |
| **Architecture Status** | **Platform Frozen** — layered Express/Prisma API + AppShell plug-in React frontend |

### Stack (as implemented)

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, TanStack Query, React Router 7 |
| Backend | Node.js, Express, Prisma ORM |
| Database | MySQL |
| Auth | JWT access + refresh tokens, role-name RBAC |
| API Docs | Swagger UI (`/api-docs`) |

```
Browser (React AppShell)
        │  HTTPS / JSON
        ▼
Express API (/api/*)
        │
        ▼
Prisma → MySQL
```

---

## Project Statistics

Progress estimates are derived from implemented feature modules, API coverage, schema readiness, and UI completeness — **not** marketing targets.

| Area | Progress | Indicator | Notes |
|------|----------|-----------|--------|
| **Backend** | **64%** | `██████████░░` | Academic core + Results Engine; timetable/attendance/finance still scaffolded |
| **Frontend** | **48%** | `███████░░░░░` | 13+ registered workspaces; Results Engine live; remaining nav placeholders |
| **Database** | **74%** | `███████████░` | Results model reshaped for CA+Exam engine; grade scale linkage added |
| **UI/UX** | **68%** | `██████████░░` | Design system + AppShell mature; Ocean Blue enterprise patterns on Results |
| **Overall** | **56%** | `████████░░░░` | Platform frozen; Phase 2 Academic Operations underway |

### Delivery snapshot

| Metric | Count (codebase) |
|--------|------------------|
| Backend route modules | 35 domain routers under `/api` |
| Frontend feature workspaces (registered) | 13+ |
| Nav items still on `ModulePlaceholder` | Finance, Library, Inventory, Reports, Users, Roles |
| Prisma models | 80 |
| Git release tags present | `v0.6.0`, `v0.7.0`, `v0.9.0`, `v1.0.0-beta.1`, `v1.0.0-beta.2` |

---

## Completed Backend Modules

Full layered stack present (`routes` → `validators` → `controllers` → `services` → `repositories` → Prisma) and treated as **delivered** for Academic Core / Platform Foundation.

### Security & platform

- [x] ✓ Authentication (login, refresh, profile/me)
- [x] ✓ Users
- [x] ✓ Roles & permissions (RBAC authorize middleware)
- [x] ✓ Audit Trail (`/api/audits` + audit service)
- [x] ✓ Global Configuration / System Settings (`/api/settings`)
- [x] ✓ School Settings / School Profile (`/api/school-settings`)
- [x] ✓ File Upload (`/api/uploads` + static `/uploads`)
- [x] ✓ Notification Framework (`/api/notifications`, IN_APP; EMAIL/SMS-ready)
- [x] ✓ Swagger documentation (`/api-docs`)

### Academic core

- [x] ✓ Students (CRUD, archive, restore)
- [x] ✓ Guardians (+ student–guardian links)
- [x] ✓ Teachers
- [x] ✓ Departments
- [x] ✓ Classes (`SchoolClass`)
- [x] ✓ Subjects
- [x] ✓ Teacher Subject Assignment
- [x] ✓ Class Subject Allocation
- [x] ✓ Academic Years
- [x] ✓ Terms
- [x] ✓ Enrollments

### Supporting APIs (implemented, used by shell/dashboard)

- [x] ✓ Dashboard
- [x] ✓ Dashboard Widgets

### Backend APIs scaffolded (not product-complete for Phase 2+)

These have routes/services/repositories but are **not** marked complete for delivery — product sprints remain.

| Module | API status | Product status |
|--------|------------|----------------|
| Timetable | Product module (Sprint 7.1) | Delivered / in use |
| Attendance | Product module (Sprint 7.2) | Delivered / in use |
| Assessment | Product module (Sprint 7.3) | Delivered / in use |
| Examination | Product module (Sprint 7.4) | Delivered / in use |
| Results | **Product module (Sprint 7.5)** | **Delivered** |
| Report Cards | **Product module (Sprint 7.6)** | **Delivered** |
| Student Promotion | **Product module (Sprint 7.7)** | **Delivered** |
| Fee Types / Structures / Invoices / Payments / Allocations / Receipts | Scaffolded | Later (Finance) |
| Announcements / Events | Thin CRUD | Later |

---

## Completed Frontend Modules

Registered in `PAGE_REGISTRY` (`frontend/src/routes/app.routes.jsx`) with full feature folders under `frontend/src/features/`.

### Shell & system

- [x] ✓ Login / Auth shell
- [x] ✓ Dashboard (presentational composition; live KPIs later)
- [x] ✓ Settings (School Profile, Platform Config, Audit Trail, Notifications)

### Academic workspaces

- [x] ✓ Students (list, form, profile, archive, export, polish)
- [x] ✓ Teachers
- [x] ✓ Guardians
- [x] ✓ Classes
- [x] ✓ Subjects
- [x] ✓ Teacher Subjects
- [x] ✓ Class Subjects
- [x] ✓ Academic Years
- [x] ✓ Terms
- [x] ✓ Enrollments
- [x] ✓ Assessments (Sprint 7.3)
- [x] ✓ Examinations (Sprint 7.4)
- [x] ✓ Results Engine (Sprint 7.5) — generate, publish/lock, analytics, exports
- [x] ✓ Report Cards (Sprint 7.6) — snapshots from published results, A4 preview/PDF, bulk class generate, Student Profile integration
- [x] ✓ Student Promotion & Graduation (Sprint 7.7) — recommend / approve / execute, graduates, analytics, exports
- [x] ✓ Timetables (Sprint 7.1)
- [x] ✓ Attendance (Sprint 7.2)

### Placeholder nav (enabled in sidebar, no feature page yet)

- [ ] Finance
- [ ] Library
- [ ] Inventory
- [ ] Reports
- [ ] Users
- [ ] Roles

### Recently wired (was placeholder)

- [x] ✓ Departments — full CRUD workspace (list/search/pagination/exports/archive)

---

## Platform Foundation

Established in **Sprint 6.8** and frozen for subsequent operational modules.

| Capability | Status | Implementation |
|------------|--------|----------------|
| **Authentication & RBAC** | ✓ Complete | JWT access/refresh; `authenticate` / `authorize(role)`; frontend Auth context + silent refresh |
| **School Settings** | ✓ Complete | `SchoolProfile` + `/api/school-settings`; Settings UI · School Profile tab |
| **Global Configuration** | ✓ Complete | `SystemSetting` + `/api/settings` (`/map`, `/bulk`); Platform Config tab |
| **Audit Trail** | ✓ Complete | `AuditLog` + `audit.service` + `/api/audits`; Audit Trail tab |
| **File Upload** | ✓ Complete | Multer middleware, `FileAsset`, `/api/uploads`, static `/uploads` |
| **Notification Framework** | ✓ Complete | `Notification` model + `/api/notifications`; IN_APP delivery; EMAIL/SMS channel readiness |
| **Swagger** | ✓ Complete | `swagger-ui-express` at `/api-docs` |
| **Prisma** | ✓ Complete | Schema v2.0, MySQL, singleton client via `config/prisma` → `database/db` |
| **Shared Components** | ✓ Complete | `components/ui/*`, `components/dashboard/*`, tokens |
| **Enterprise UI** | ✓ Complete | AppShell (Sidebar, Header, Footer), design tokens, Drawer/Modal/Toast/Skeleton patterns |

### Architecture freeze rules (in force)

1. Do **not** modify `AppShell` when adding modules — register in `PAGE_REGISTRY` only.
2. Reuse shared UI (Drawer, StatCard, Toast, Skeleton) — no parallel shells.
3. Backend stays layered: Routes → Validators → Controllers → Services → Repositories → Prisma.
4. Students remains the reference feature-module shape.
5. Platform services (audit, upload, notify, settings) are shared — do not re-implement per module.

---

## Database Models

**80** Prisma models in `backend/prisma/schema.prisma`. Completeness below means: schema defined **and** actively used by delivered repositories/services (or platform foundation).

### Complete — Security & platform

| Model | Status |
|-------|--------|
| `Role` | ✓ Complete |
| `Permission` | ✓ Complete |
| `RolePermission` | ✓ Complete |
| `User` | ✓ Complete |
| `AuditLog` | ✓ Complete |
| `SystemSetting` | ✓ Complete |
| `SchoolProfile` | ✓ Complete |
| `FileAsset` | ✓ Complete |
| `Notification` | ✓ Complete |
| `LoginHistory` | ✓ Schema + auth usage |
| `PasswordResetToken` | ✓ Schema + auth usage |

### Complete — Academic core

| Model | Status |
|-------|--------|
| `AcademicYear` | ✓ Complete |
| `Term` | ✓ Complete |
| `Department` | ✓ Complete |
| `SchoolClass` | ✓ Complete |
| `Teacher` | ✓ Complete |
| `Subject` | ✓ Complete |
| `TeacherSubject` | ✓ Complete |
| `ClassSubject` | ✓ Complete |
| `Guardian` | ✓ Complete |
| `StudentGuardian` | ✓ Complete |
| `Student` | ✓ Complete |
| `Enrollment` | ✓ Complete |

### Schema + API scaffold (product incomplete)

| Model | Status |
|-------|--------|
| `Attendance` | ✓ Product complete (Sprint 7.2) |
| `Timetable` / `TimetableEntry` | ✓ Product complete (Sprint 7.1) |
| `Assessment` / `AssessmentScore` | ✓ Product complete (Sprint 7.3) |
| `Examination` / `ExaminationScore` | ✓ Product complete (Sprint 7.4) |
| `Result` | ✓ Product complete (Sprint 7.5 Results Engine) |
| `ReportCard` | ✓ Product complete (Sprint 7.6 Report Cards) |
| `Grade` / `GradeScale` | ✓ Linked + seeded + admin CRUD API (`/api/grades`) |
| `FeeType` / `FeeStructure` / `StudentInvoice` | Schema + API scaffold |
| `Payment` / `PaymentAllocation` / `Receipt` | Schema + API scaffold |
| `Scholarship` / `StudentDiscount` / `FinancialTransaction` | Schema only / partial |
| `Announcement` / `Event` | Schema + thin API |
| `Dashboard` / `DashboardWidget` | Schema + API |
| `Message` / `SmsLog` / `EmailLog` | Schema (channel readiness) |
| `Report` / `ReportExecution` | Schema only |

### Schema only — future domains

| Domain | Models |
|--------|--------|
| **Library** | `BookCategory`, `BookAuthor`, `Book`, `LibraryMember`, `LibraryLoan` |
| **Inventory / Procurement** | `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`, `StockItem`, `StockMovement`, `StockIssue` |
| **HR / Payroll** | `Employee`, `EmployeeAttendance`, `LeaveRequest`, `Payroll` |
| **Transport** | `TransportRoute`, `Vehicle`, `Driver`, `StudentTransport` |
| **Hostel** | `Hostel`, `HostelRoom`, `Bed`, `BedAllocation`, `HostelInspection` |
| **Assets** | `AssetCategory`, `Asset`, `AssetAssignment`, `AssetMaintenance`, `AssetDisposal` |
| **System ops** | `SystemBackup`, `SystemLog`, `ApiKey` |

---

## Remaining Modules

### Academic Operations

| Module | Backend | Frontend | Priority |
|--------|---------|----------|----------|
| Timetable Management | ✓ Complete | ✓ Complete | Sprint 7.1 |
| Attendance | ✓ Complete | ✓ Complete | Sprint 7.2 |
| Assessment / Examinations | ✓ Complete | ✓ Complete | Sprint 7.3 / 7.4 |
| Results Engine | ✓ Complete | ✓ Complete | **Sprint 7.5** |
| Report Cards | ✓ Complete | ✓ Complete | **Sprint 7.6** |
| Student Promotion | ✓ Complete | ✓ Complete | **Sprint 7.7** |
| Departments (UI) | ✓ Complete | ✓ Complete | Done |

### Finance

| Module | Backend | Frontend |
|--------|---------|----------|
| Fee Types / Structures | API scaffolded | Placeholder (`/finance`) |
| Student Invoices | API scaffolded | Not started |
| Payments & Allocations | API scaffolded | Not started |
| Receipts | API scaffolded | Not started |
| Scholarships / Discounts | Schema | Not started |

### Library

| Module | Status |
|--------|--------|
| Catalogue, members, loans | Schema only — not started |

### Hostel

| Module | Status |
|--------|--------|
| Hostels, rooms, beds, allocations, inspections | Schema only — not started |

### Transport

| Module | Status |
|--------|--------|
| Routes, vehicles, drivers, student transport | Schema only — not started |

### Inventory

| Module | Status |
|--------|--------|
| Stock, suppliers, POs, issues | Schema only — not started |

### Parent Portal

| Module | Status |
|--------|--------|
| Parent-facing portal | Out of scope until later (roadmap) |

### Teacher Portal

| Module | Status |
|--------|--------|
| Dedicated teacher workspace | Not started (admin shell only today) |

### Student Portal

| Module | Status |
|--------|--------|
| Dedicated student workspace | Out of scope until later (roadmap) |

---

## Current Sprint

| Field | Value |
|-------|--------|
| **Phase** | Phase 2 – Academic Operations |
| **Sprint** | **Sprint 7.7 – Student Promotion & Graduation** |
| **Status** | **Delivered** |
| **Prerequisite** | ✓ Platform Foundation frozen (Sprint 6.8) |
| **Prerequisite** | ✓ Report Cards (Sprint 7.6) |

### Sprint 7.7 delivered scope

- Promotion APIs: recommend, approve/unapprove, execute, cancel, archive/restore, stats, graduates, student history
- Decisions: Promoted, Promoted on Probation, Repeat, Graduated, Withdrawn, Transferred
- Workflow: Draft (Preview) → Approved → Executed (RBAC per stage)
- Recommendations from **published/locked Report Cards** with configurable average thresholds
- Execute creates next-year enrollments for continuation decisions; exit decisions mark students inactive without deleting history
- Frontend Promotions workspace (directory, graduates, analytics, archive, recommend/edit, bulk actions, exports)
- Soft archive, duplicate prevention, audit logging, Swagger, role-name RBAC

### Next up

- Finance / fee operations (as roadmap allows)

---

## Git Release History

Built from existing Git tags and release commits. Tags marked **tag**; commit-only releases noted.

| Version | Date (UTC) | Type | Summary |
|---------|------------|------|---------|
| **v0.6.0** | 2026-08-04 | tag | Guardian and Academic Year modules completed |
| **v0.7.0** | 2026-08-04 | tag | Academic Calendar completed and regression fixes |
| **v0.8.0** | 2026-08-04 | commit *(no tag)* | Classes module completed |
| **v0.9.0** | 2026-08-05 | tag | Subjects module completed |
| **v1.0.0-beta.1** | 2026-08-05 | tag | Teacher Subject Assignment completed |
| **v1.0.0-beta.2** | 2026-08-05 | tag | Class Subject Allocation completed |
| **v1.0.0-rc.1** | 2026-08-05 | commit *(no tag)* | Academic Core completed (Enrollments) |
| **v1.0.0-rc.2** | — | — | *Not present* |
| **v0.6.8** | 2026-08-05 | milestone doc | Platform Foundation & Architecture Freeze (`VERSION_HISTORY.md`) |

### Earlier frontend foundation (commits)

| Sprint | Summary |
|--------|---------|
| Sprint 1 | Enterprise AppShell, modular navigation, design system, auth shell |
| Sprint 2 | Dashboard 2.0, enterprise UI polish, shared dashboard components |
| Sprint 3 | Students module production-ready (CRUD, exports, pagination, profile) |

### Timeline (visual)

```
v0.6.0 ──► v0.7.0 ──► v0.8.0* ──► v0.9.0 ──► v1.0.0-beta.1 ──► v1.0.0-beta.2 ──► v1.0.0-rc.1*
 Guardians     Calendar    Classes     Subjects   Teacher↔Subject   Class↔Subject   Enrollments
     │                                                                              │
     └──────────────── Academic Core train ─────────────────────────────────────────┘

 Sprint 6.8 (v0.6.8) ── Platform Foundation & Architecture Freeze ──► Sprint 7.1 Timetable (next)
 * = release commit without Git tag at last review
```

---

## Architecture Summary

### Backend request flow

```
HTTP
 → Routes (+ Swagger annotations)
 → authenticate / authorize
 → Validators (express-validator) → validate middleware
 → Controllers (HTTP only)
 → Services (business rules)
 → Repositories (Prisma queries)
 → Prisma Client → MySQL
 → ApiResponse (success | created | error | validationError)
```

### Layer map

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Prisma** | `backend/prisma/schema.prisma` | Schema, enums, relations |
| **Repository** | `backend/repositories/` | Data access / selects |
| **Service** | `backend/services/` | Business logic, conflicts, audits/notifications |
| **Controller** | `backend/controllers/` | Request/response mapping |
| **Validator** | `backend/validators/` | Input rules |
| **Routes** | `backend/routes/` (+ `index.js`) | Paths, middleware order; mounted once at `/api` |
| **Middleware** | `backend/middleware/` | Auth, validation, errors, upload, audit helpers |
| **Server** | `backend/server.js` | Express config, static `/uploads`, Swagger, `/api` |

### Frontend architecture

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **React Feature Modules** | `frontend/src/features/<module>/` | Page composition, tables, forms, mappers, export |
| **Thin pages** | `frontend/src/pages/<module>/` | Route entry only |
| **PAGE_REGISTRY** | `frontend/src/routes/app.routes.jsx` | Module registration (no AppShell edits) |
| **Services** | `frontend/src/services/` | Axios API clients |
| **Shared Design System** | `components/ui`, `components/dashboard`, `styles/tokens.css` | Primitives + tokens |
| **Enterprise shell** | `layouts/AppShell.jsx`, `components/layout/*` | Chrome only |

### Shared design system (implemented)

**UI primitives:** Button, Input, PasswordInput, Card, Drawer, Modal, ConfirmDialog, Badge, Avatar, Toast, Skeleton, Spinner, Typography, Table, Alert, Checkbox, Tooltip, Divider, PageHeader, Logo, AnimatedCounter  

**Dashboard widgets:** SectionHeader, StatCard, DashboardPanel, EmptyState, StatsStrip  

**Layouts:** AppShell, AuthLayout, Sidebar, Header, Footer, Breadcrumb, CommandPalette  

---

## Next Development Roadmap

Ordered delivery sequence for remaining product work:

```
Timetable
  → Attendance
  → Assessment
  → Examination
  → Results
  → Report Cards ✓
  → Promotion ✓
  → Fees
  → Library
  → Hostel
  → Transport
  → Inventory
```

| # | Module | Phase | Status |
|---|--------|-------|--------|
| 1 | Timetable | Academic Operations | ✓ Sprint 7.1 |
| 2 | Attendance | Academic Operations | ✓ Sprint 7.2 |
| 3 | Assessment | Academic Operations | ✓ Sprint 7.3 |
| 4 | Examination | Academic Operations | ✓ Sprint 7.4 |
| 5 | Results Engine | Academic Operations | ✓ Sprint 7.5 |
| 6 | **Report Cards** | Academic Operations | ✓ Sprint 7.6 |
| 7 | **Student Promotion** | Academic Operations | ✓ Sprint 7.7 |
| 8 | Fees | Finance | Queued |
| 9 | Library | Operations | Queued |
| 10 | Hostel | Operations | Queued |
| 11 | Transport | Operations | Queued |
| 12 | Inventory | Operations | Queued |

Portals (Parent / Teacher / Student) follow after core operational modules unless priorities change.

---

## How to update this document

After each sprint:

1. Bump **Current Version** / **Current Sprint** and progress percentages.
2. Move finished items into **Completed** checklists (mark ✓).
3. Refresh **Git Release History** from `git tag` and release commits.
4. Adjust model completeness when new repositories go live.
5. Keep percentages honest — prefer understatement over inflation.

### Related documents

- [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)
- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)
- [VERSION_HISTORY.md](./VERSION_HISTORY.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [frontend/DESIGN_SYSTEM.md](./frontend/DESIGN_SYSTEM.md)
- [frontend/FRONTEND_ARCHITECTURE.md](./frontend/FRONTEND_ARCHITECTURE.md)
