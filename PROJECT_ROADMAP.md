# DIS-SMS Project Roadmap

> Data Insight School Management System — strategic delivery plan.  
> Architecture freeze applied at Sprint 3.5. New ERP modules follow AppShell plug-in rules.

---

## Vision

Build a secure, layered school ERP covering academics, finance, operations, and communication — with a token-based React shell and an Express/Prisma/MySQL API.

---

## Current status (Sprint 3.5)

| Area | Status |
|------|--------|
| Backend foundation (auth, RBAC, layered modules) | Complete |
| Design system / UI kit / tokens | Complete |
| AppShell + navigation plug-in | Complete |
| Dashboard 2.0 (presentational foundation) | Complete |
| Students workspace (CRUD, profile, archive, export, polish) | Complete |
| Remaining nav modules | Placeholder routes only |

**Implemented shell pages:** Dashboard, Students.  
**All other nav items** render `ModulePlaceholder` until registered in `PAGE_REGISTRY`.

---

## Completed delivery (summary)

### Platform
- JWT auth, refresh, role authorization
- Prisma schema + repositories/services/controllers/routes
- Swagger, validation, audit, rate limiting
- Frontend AppShell (Sidebar, Header, Footer, Outlet)
- Design tokens (`tokens.css`), shared UI primitives, dashboard widgets

### Students (Sprint 3 → 3 Batch 5)
- Live list / create / edit / archive / restore
- Profile drawer, registration drawer (create + edit)
- Client filters, stats, pagination, sorting
- Excel / PDF export
- Toasts, skeletons, silent JWT refresh
- Active / Archived views

---

## Near-term roadmap

### Sprint 4 — Teachers (reference second module)
- Teachers feature folder mirroring Students patterns
- List, stats, drawer form, profile, soft-delete/restore
- Wire `GET/POST/PUT/DELETE /api/teachers` (+ related)
- Register page in `PAGE_REGISTRY` only (no AppShell changes)

### Sprint 5 — Classes & Academic Years
- Classes / Academic Years workspaces
- Slim class dropdown APIs for enrollment UX
- Link students/teachers to classes

### Sprint 6 — Attendance
- Daily attendance capture UI
- Class/date filters, bulk mark present/absent
- Backend attendance endpoints already scaffolded — wire UI

### Sprint 7 — Results & Examinations
- Exam setup, score entry, report card views
- Align with existing examination/result APIs

### Sprint 8 — Finance core
- Fee structures, student invoices, payments
- Finance dashboard widgets (live data)

### Sprint 9 — Communication
- Announcements, notifications, events UIs
- Admin broadcast + role targeting

### Sprint 10 — System administration
- Users, Roles, Settings workspaces
- Permission-aware UI gating from `permissions.config.js`

### Sprint 11 — Reports & analytics
- Operational reports
- Replace Dashboard placeholders with live KPIs (`/api/dashboard`)

### Sprint 12 — Hardening
- E2E tests for critical paths
- Performance pass (pagination APIs, code-split exports)
- Accessibility audit
- Production deploy checklist

---

## Architecture freeze rules (from Sprint 3.5)

1. **Do not modify AppShell** when adding modules — register pages in `app.routes.jsx` / `PAGE_REGISTRY`.
2. **Do not invent parallel shells** — reuse Drawer, DashboardPanel, StatCard, Toast, Skeleton.
3. **Backend stays layered** — routes → validators → controllers → services → repositories → Prisma.
4. **Students is the reference module** — new modules copy its folder shape and UX patterns.
5. **No new ERP features in freeze sprints** — docs, standards, and tech debt only unless scheduled.

---

## Success metrics

- New module added without AppShell edits
- All list screens share pagination/sort/export conventions
- Auth failures always attempt refresh before login redirect
- Bundle stays manageable via lazy-loaded heavy deps
- Backend validators match Prisma schema (no phantom fields)

---

## Out of scope (until later)

- Mobile native apps
- Multi-tenant SaaS billing
- Parent/student public portals
- Offline-first sync
