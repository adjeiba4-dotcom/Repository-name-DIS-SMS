# DIS-SMS Coding Standards

> Conventions for frontend and backend contributors.  
> Aligned with Sprint 3.5 architecture freeze. Students module is the reference implementation.

---

## 1. General principles

1. **Prefer clarity over cleverness** — readable names, small functions, explicit error messages.
2. **Match existing patterns** — before inventing a new abstraction, copy Students / existing controllers.
3. **No drive-by refactors** — change only what the task requires.
4. **Tokens over hardcoding** — colors, spacing, type, radii, z-index from `tokens.css` / CSS variables.
5. **Security first** — never commit secrets; validate all inputs; authorize every mutating API.

---

## 2. Frontend standards

### 2.1 Language & tooling

- React function components; JavaScript (JSX) unless the module already uses TS
- Vite for build; ESLint for lint
- Prefer TanStack Query for server state
- Prefer `cn()` (`clsx` + `tailwind-merge`) for class composition

### 2.2 File organization

```
features/<module>/
  <Module>Page.jsx          # composition + data orchestration
  components or co-located  # table, toolbar, drawers
  *.mappers.js              # API ↔ UI mapping
  *.export.js               # optional exports
  index.js                  # public exports

pages/<module>/<Module>.jsx # thin route entry → feature page
services/<domain>/*.js      # axios calls only
```

### 2.3 Components

- Reuse `components/ui/*` and `components/dashboard/*` before creating new primitives
- Drawers for create/edit/profile; Modal for destructive confirmations
- Toast (`Toast.jsx`) for success/error feedback; keep field-level errors on inputs
- Skeletons for list/profile/stats loading — not only spinners
- Do not hardcode hex colors in feature UI

### 2.4 Forms

- Mark required fields; validate client-side before submit
- Map enums for API (`Male` → `MALE`, `Active` → `ACTIVE`)
- Omit empty optional fields from payloads
- Registration/edit should share one form component with a `mode` prop (see Students)

### 2.5 Routing & shell

- Never edit AppShell to add a module
- Register pages in `PAGE_REGISTRY`
- Nav items: `navigation.config.js` (`enabled`, `path`, `id` must align)

### 2.6 Naming

| Kind | Convention |
|------|------------|
| Components | PascalCase files (`StudentTable.jsx`) |
| Hooks | `useX` |
| Services | camelCase functions (`getStudents`) |
| Constants | UPPER_SNAKE or exported const objects |
| CSS vars | `--color-*`, `--space-*`, `--font-*` |

### 2.7 Imports

- Relative imports within a feature
- Prefer feature barrel (`index.js`) for external consumers
- Keep route pages thin — no large business UI in `pages/`

---

## 3. Backend standards

### 3.1 Layering (mandatory)

```
routes → middleware → validators → controllers → services → repositories → Prisma
```

- Controllers: no Prisma calls
- Services: business rules, NotFound/Conflict
- Repositories: queries + `select` shapes only

### 3.2 Responses

Always use `ApiResponse` from `utils/response.js`:

- `success`, `created`, `error`, `validationError`, `paginated`

Do not introduce ad-hoc response shapes for new endpoints.

### 3.3 Validation

- express-validator chains in `validators/*`
- Rules must match Prisma schema (no fields that do not exist on models)
- Use `optional({ checkFalsy: true })` for optional emails/strings

### 3.4 Auth

- Protect routes with `authenticate` + `authorize(...)`
- Never trust client role claims without middleware

### 3.5 Naming

| Kind | Convention |
|------|------------|
| Files | kebab or camel consistent with folder (`student.controller.js`) |
| Exports | `exports.methodName` or `module.exports` |
| Prisma models | PascalCase; DB tables via `@@map` |

Prefer consistent controller filenames (`feeType.controller.js` style, not mixed casing).

### 3.6 Errors

Throw domain errors (`NotFoundError`, `ConflictError`, …) from services; let `error.middleware.js` format the response.

---

## 4. API contract conventions

- Base path: `/api`
- JSON only; dates as ISO-8601
- Soft delete via `deletedAt` + status where applicable
- List endpoints should eventually support server pagination/search (prefer over loading all rows)

---

## 5. Git & PR hygiene

- Commit when asked; clear messages (why over what)
- Do not commit `.env`, dumps with secrets, or `node_modules`
- Prefer small PRs scoped to one module or one concern
- Update VERSION_HISTORY when cutting a release milestone

---

## 6. Testing expectations (minimum)

| Area | Expectation |
|------|-------------|
| Backend | Smoke/API tests for critical paths; expand beyond single dashboard test |
| Frontend | Build must pass (`npm run build`); lint clean on touched files |
| Manual | Happy path + auth expiry + validation errors for each new CRUD module |

---

## 7. Anti-patterns (do not)

- Importing features into AppShell
- Duplicating `displayName` / select styles instead of extracting once
- Using showcase `components/ui/Table.jsx` for production lists without adapting it
- Shipping unused dependencies (bootstrap, unused chart libs)
- Over-fetching nested relations on simple dropdown endpoints
- Hardcoding API base URLs outside `constants/api.js` (except axios `BASE_URL` config)

---

## 8. Reference modules

| Concern | Look at |
|---------|---------|
| Feature UX | `frontend/src/features/students/` |
| Shell / routing | `layouts/AppShell.jsx`, `routes/app.routes.jsx` |
| Tokens | `frontend/src/styles/tokens.css` |
| Backend CRUD | `backend/**/student.*` |
| Auth client | `frontend/src/api/axios.js`, `services/auth/` |
