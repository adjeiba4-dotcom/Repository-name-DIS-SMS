# DIS-SMS Architecture Guide

> Canonical description of the current system architecture.  
> Last aligned: Sprint 3.5 (Architecture Freeze).

---

## 1. System overview

DIS-SMS is a full-stack school ERP:

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, TanStack Query, React Router 7 |
| Backend | Node.js, Express, Prisma ORM |
| Database | MySQL |
| Auth | JWT access + refresh tokens, role-based authorization |

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

## 2. Repository layout

```
DIS-SMS/
├── frontend/                 # Vite React application
│   ├── src/
│   │   ├── api/              # Axios instance (auth interceptors)
│   │   ├── components/
│   │   │   ├── ui/           # Design-system primitives
│   │   │   ├── dashboard/    # Shared dashboard widgets
│   │   │   ├── layout/       # Sidebar, Header, Footer
│   │   │   └── common/       # ProtectedRoute, etc.
│   │   ├── config/           # Nav, app, theme, permissions
│   │   ├── constants/        # API paths
│   │   ├── contexts/         # Auth, Sidebar
│   │   ├── features/         # Feature modules (students, dashboard, …)
│   │   ├── layouts/          # AppShell, AuthLayout
│   │   ├── pages/            # Thin route entries
│   │   ├── routes/           # AppRouter + PAGE_REGISTRY
│   │   ├── services/         # API service functions
│   │   └── styles/tokens.css # Design tokens
│   └── …
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── middleware/
│   ├── prisma/
│   ├── database/
│   └── server.js
├── PROJECT_ROADMAP.md
├── ARCHITECTURE_GUIDE.md
├── CODING_STANDARDS.md
└── VERSION_HISTORY.md
```

Prefer `backend/` and `frontend/` scripts over any legacy root `package.json` scripts.

---

## 3. Frontend architecture

### 3.1 AppShell plug-in model

`AppShell` provides chrome only (overlay, Sidebar, Header, main Outlet, Footer).  
**Modules never import into AppShell.** New modules:

1. Add/enable nav item in `frontend/src/config/navigation.config.js`
2. Implement feature under `frontend/src/features/<module>/`
3. Add thin page under `frontend/src/pages/<module>/`
4. Register in `PAGE_REGISTRY` inside `frontend/src/routes/app.routes.jsx`

Unregistered nav items render `ModulePlaceholder`.

### 3.2 Feature modules

**Students (reference implementation)**  
`frontend/src/features/students/`

- Page composition, table, toolbar, stats
- Registration drawer (create/edit), profile drawer
- Delete confirm, mappers, Excel/PDF export
- Services: `services/students`, `services/guardians`, `services/classes`

**Dashboard**  
`frontend/src/features/dashboard/` — composition + presentational placeholders (live KPIs later).

### 3.3 Shared UI

| Location | Purpose |
|----------|---------|
| `components/ui/*` | Button, Input, Card, Drawer, Modal, Badge, Avatar, Toast, Skeleton, Typography, … |
| `components/dashboard/*` | SectionHeader, StatCard, DashboardPanel, EmptyState |
| `styles/tokens.css` | Colors, space, type, radius, shadow, z-index, shell dimensions |

Styling convention: Tailwind utilities + CSS variables from tokens (`bg-[var(--color-…)]`). Avoid hardcoded colors.

### 3.4 Data & auth (frontend)

- Axios (`api/axios.js`): attaches Bearer token; on 401 attempts silent refresh via `POST /api/auth/refresh-token`; on failure clears storage and redirects to `/login?reason=session-expired`
- TanStack Query for server state (students list, classes, archived)
- Auth context wraps the app; `ProtectedRoute` gates the shell

---

## 4. Backend architecture

### 4.1 Request flow

```
HTTP → routes → authenticate/authorize → validators → validate
    → controller → service → repository → Prisma → MySQL
    → ApiResponse (success | created | error | validationError)
```

### 4.2 Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| Routes | Path, middleware order, Swagger annotations |
| Validators | express-validator rules |
| Controllers | HTTP in/out only; call services |
| Services | Business rules, conflicts, existence checks |
| Repositories | Prisma queries / selects |
| Middleware | Auth, validation, errors, audit, rate limit |

### 4.3 Standard responses

Use `backend/utils/response.js` (`ApiResponse`):

```json
{
  "success": true,
  "message": "…",
  "data": {},
  "timestamp": "ISO-8601"
}
```

### 4.4 Students API (consumed by UI)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/students` | Active (non-deleted) |
| GET | `/api/students/archived` | Soft-deleted |
| GET | `/api/students/:id` | Detail + guardian + class |
| POST | `/api/students` | Create (requires `guardianId`, `classId`) |
| PUT | `/api/students/:id` | Update |
| DELETE | `/api/students/:id` | Soft archive |
| PATCH | `/api/students/:id/restore` | Restore |
| GET | `/api/classes` | Class options |
| POST/PUT | `/api/guardians` | Guardian create/update |

Auth: Bearer JWT + Administrator role (current student routes).

---

## 5. Cross-cutting concerns

- **RBAC:** Backend `authorize(role)`; frontend `permissions.config.js` prepared for UI gating
- **Validation:** express-validator arrays + `validate` middleware
- **Errors:** Custom `ApiError` hierarchy + global `error.middleware.js`
- **Docs:** Swagger via backend config
- **Design system:** Documented in `frontend/DESIGN_SYSTEM.md` and component guides

---

## 6. Adding a new module (checklist)

1. Confirm backend routes/services exist (or add following layering)
2. Create `features/<name>/` using Students as template
3. Add `pages/<name>/` thin entry
4. Enable nav item + `PAGE_REGISTRY` entry
5. Use tokens + shared UI; no AppShell edits
6. Prefer Query + service functions; map API ↔ UI in `*.mappers.js`
7. Toasts for success/error; skeletons for loading

---

## 7. Explicit non-goals of AppShell

AppShell must not:

- Import feature modules
- Contain business forms or tables
- Encode per-module permissions logic beyond chrome

---

## Related docs

- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [VERSION_HISTORY.md](./VERSION_HISTORY.md)
- [frontend/FRONTEND_ARCHITECTURE.md](./frontend/FRONTEND_ARCHITECTURE.md)
- [frontend/DESIGN_SYSTEM.md](./frontend/DESIGN_SYSTEM.md)
