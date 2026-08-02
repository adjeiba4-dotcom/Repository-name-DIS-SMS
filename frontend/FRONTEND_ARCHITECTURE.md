# FRONTEND_ARCHITECTURE

## Title

DIS-SMS Frontend Architecture

## Purpose

Describe the enterprise frontend structure, layering, configuration approach, and module boundaries for the React application.

## Current Status

Batch 3 delivers a module-independent AppShell with nested `<Outlet />` routing, config-driven sidebar navigation, and durable module/route registration. Design tokens, UI kit, and auth from earlier batches remain in place. Dashboard remains a Dashboard 2.0 placeholder.

## Scope

- Folder structure (`config`, `styles`, `utils`, `features`, `components`, `pages`, etc.)
- Configuration-driven navigation (`navigation.config.js`)
- AppShell chrome: Sidebar, Header, Content (`Outlet`), Footer
- Module plug-in via `routes/app.routes.jsx` page registry (AppShell unchanged)
- Design-token strategy via CSS variables
- Reserved module folders under `src/features/`

## Architecture rules

1. **AppShell independence** — `layouts/AppShell.jsx` must not import business modules. It only composes chrome + `<Outlet />`.
2. **Config-driven navigation** — Sidebar items are rendered solely from `config/navigation.config.js`.
3. **Module plug-in** — New modules add a nav item + a `PAGE_REGISTRY` entry (or feature route module). AppShell is not edited.
4. **Roles placeholders only** — Nav items may include `roles`; no permission filtering yet.
5. **Dashboard 2.0** — `pages/dashboard/Dashboard.jsx` stays a placeholder until the Dashboard 2.0 batch.
6. **No throwaway scaffolding** — Prefer durable placeholders (`ModulePlaceholder`) over temporary pages that must be rewritten.

### Nested routing model

```jsx
<Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
  {/* routes built from navigation.config + PAGE_REGISTRY */}
</Route>
```

### Adding a future module

1. Implement UI under `features/<module>/` (or a page entry).
2. Add/enable the item in `navigation.config.js`.
3. Register the page in `routes/app.routes.jsx` `PAGE_REGISTRY`.
4. Do not modify `AppShell`, `Sidebar`, or `Header` for module content.

## Future Work

- Permission-aware navigation filtering (consume `roles` / permissions.config)
- Feature-module co-location patterns and lazy route loading
- Dashboard 2.0 widgets (consume `dashboard.config.js`)
- Global search and notifications wiring

## Revision History

| Date | Batch | Notes |
|------|-------|-------|
| 2026-08-02 | Batch 1 | Stub created with required section headers |
| 2026-08-02 | Batch 3 | AppShell + nested routes + plug-in rules documented |
