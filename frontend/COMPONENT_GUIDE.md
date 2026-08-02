# COMPONENT_GUIDE

## Title

DIS-SMS Component Guide

## Purpose

Catalog reusable UI primitives, their public props, and usage patterns for the frontend design system.

## Current Status

Batch 2 – Enterprise Design System: shared UI primitives consume Batch 1 tokens (`styles/tokens.css`) and `utils/cn.js`. New primitives: Avatar, Tooltip, PageHeader. Typography includes Label.

## Scope

- UI primitives under `src/components/ui/`
- Shared class helper `utils/cn.js`
- Token-backed colors, radii, type, shadows, and z-index

## Shared conventions

All design-system primitives support (where appropriate):

| Prop | Type | Notes |
|------|------|--------|
| `variant` | `string` | Visual style |
| `size` | `string` | Density / scale |
| `className` | `string` | Merged via `cn` / `tailwind-merge` |
| `disabled` | `boolean` | Dimmed / non-interactive when supported |

Prefer CSS variables from `src/styles/tokens.css` over hardcoded palette classes.

---

## Button

**File:** `src/components/ui/Button.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Button label / content |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Native button type |
| `variant` | `"primary" \| "secondary" \| "success" \| "danger" \| "outline" \| "ghost"` | `"primary"` | Style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height / padding |
| `loading` | `boolean` | `false` | Shows spinner; disables control |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | `""` | Extra classes (e.g. `w-auto`) |

Accessibility: `aria-disabled`, `aria-busy` when loading, focus-visible ring.

### Usage

```jsx
import Button from "../components/ui/Button";

<Button type="submit" variant="primary" size="lg" loading={saving}>
  Save
</Button>

<Button variant="outline" size="sm" className="w-auto">
  Cancel
</Button>
```

---

## Input

**File:** `src/components/ui/Input.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Optional field label |
| `type` | `string` | `"text"` | Input type |
| `name` | `string` | — | Name / default id |
| `id` | `string` | generated | Explicit id |
| `placeholder` | `string` | `""` | Placeholder |
| `value` | `string` | — | Controlled value |
| `onChange` | `function` | — | Change handler |
| `error` | `string` | `""` | Error message |
| `disabled` | `boolean` | `false` | Disabled |
| `required` | `boolean` | `false` | Required marker + `aria-required` |
| `leftIcon` / `rightIcon` | `ReactNode` | `null` | Adornments |
| `variant` | `"default" \| "filled" \| "ghost"` | `"default"` | Surface style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height |
| `className` | `string` | `""` | Wrapper classes |

Accessibility: `htmlFor` / `id`, `aria-invalid`, `aria-describedby` + `role="alert"` on errors.

### Usage

```jsx
import Input from "../components/ui/Input";

<Input
  label="Email Address"
  type="email"
  name="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  error={errors.email}
/>
```

---

## Card

**File:** `src/components/ui/Card.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Card content |
| `variant` | `"glass" \| "default" \| "outlined" \| "muted"` | `"glass"` | `glass` preserves auth card look |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | Radius / padding (non-glass) |
| `disabled` | `boolean` | `false` | Non-interactive dimmed |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import Card from "../components/ui/Card";

{/* Auth / glass (default) */}
<Card className="bg-white/90">...</Card>

{/* Enterprise surface */}
<Card variant="default" size="md" className="max-w-none">
  ...
</Card>
```

---

## Badge

**File:** `src/components/ui/Badge.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Label |
| `variant` | `"primary" \| "success" \| "warning" \| "danger" \| "info" \| "secondary"` | `"primary"` | Color |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding / type |
| `rounded` | `boolean` | `true` | Pill vs soft rectangle |
| `disabled` | `boolean` | `false` | Dimmed |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import Badge from "../components/ui/Badge";

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm" rounded={false}>Pending</Badge>
```

---

## Alert

**File:** `src/components/ui/Alert.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"success" \| "error" \| "warning" \| "info"` | `"info"` | Tone |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding / type |
| `title` | `string` | — | Optional heading |
| `message` | `string` | — | Body (required to render) |
| `closable` | `boolean` | `false` | Show dismiss control |
| `onClose` | `function` | — | Dismiss handler |
| `disabled` | `boolean` | `false` | Dimmed |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import Alert from "../components/ui/Alert";

<Alert variant="error" message="Invalid email or password." />
<Alert
  variant="success"
  title="Saved"
  message="Student record updated."
  closable
  onClose={() => setNotice(null)}
/>
```

---

## Modal

**File:** `src/components/ui/Modal.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Visibility |
| `title` | `string` | `""` | Dialog title |
| `children` | `ReactNode` | — | Body |
| `footer` | `ReactNode` | — | Footer actions |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Max width |
| `variant` | `"default" \| "muted"` | `"default"` | Surface |
| `disabled` | `boolean` | `false` | Blocks dismiss / interaction |
| `className` | `string` | `""` | Panel classes |
| `onClose` | `function` | — | Backdrop / Escape / close |

Accessibility: `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape to close, close button `aria-label`, body scroll lock.

### Usage

```jsx
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

<Modal
  open={open}
  title="Confirm"
  size="sm"
  onClose={() => setOpen(false)}
  footer={
    <>
      <Button variant="ghost" className="w-auto" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button className="w-auto" onClick={onConfirm}>Confirm</Button>
    </>
  }
>
  Are you sure you want to continue?
</Modal>
```

---

## Spinner

**File:** `src/components/ui/Spinner.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "inverse" \| "success" \| "danger"` | `"primary"` | Color |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Diameter |
| `disabled` | `boolean` | `false` | Dimmed |
| `className` | `string` | `""` | Wrapper classes |
| `label` | `string` | `"Loading"` | Accessible name |

### Usage

```jsx
import Spinner from "../components/ui/Spinner";

<Spinner />
<Spinner variant="inverse" size="sm" label="Loading dashboard" />
```

---

## Table

**File:** `src/components/ui/Table.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `""` | Header title |
| `columns` | `{ header, accessor }[]` | `[]` | Column defs |
| `data` | `object[]` | `[]` | Row data (`id` key) |
| `emptyMessage` | `string` | `"No records found."` | Empty state |
| `variant` | `"default" \| "outlined" \| "muted"` | `"default"` | Surface |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | Radius / type |
| `disabled` | `boolean` | `false` | Non-interactive |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import Table from "../components/ui/Table";

<Table
  title="Students"
  columns={[
    { header: "Name", accessor: "name" },
    { header: "Status", accessor: "status" },
  ]}
  data={rows}
/>
```

---

## Typography

**File:** `src/components/ui/Typography.jsx`

Exports: `H1`, `H2`, `H3`, `Body`, `Caption`, `Label`.

### Common props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content |
| `variant` | `"default" \| "secondary" \| "muted" \| "inverse" \| "link"` | varies | Text color |
| `size` | `"sm" \| "md" \| "lg"` | varies | Type scale |
| `disabled` | `boolean` | `false` | Disabled text color |
| `className` | `string` | `""` | Extra classes |
| `htmlFor` | `string` | — | `Label` only |

### Usage

```jsx
import { H1, H2, H3, Body, Caption, Label } from "../components/ui/Typography";

<H1>Dashboard</H1>
<H2 size="md">Enrollment</H2>
<H3 variant="secondary">This term</H3>
<Body>Summary copy for the section.</Body>
<Caption>Last updated 2 hours ago</Caption>
<Label htmlFor="email">Email</Label>
```

---

## Avatar

**File:** `src/components/ui/Avatar.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL |
| `alt` | `string` | `""` | Image / accessible label |
| `name` | `string` | `""` | Initials fallback |
| `variant` | `"circular" \| "rounded" \| "square"` | `"circular"` | Shape |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Dimensions |
| `disabled` | `boolean` | `false` | Dimmed / grayscale |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import Avatar from "../components/ui/Avatar";

<Avatar name="Emmanuel Adjei" size="lg" />
<Avatar src="/avatars/admin.png" alt="Admin" variant="rounded" />
```

---

## Tooltip

**File:** `src/components/ui/Tooltip.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Trigger |
| `content` | `ReactNode` | — | Tooltip text |
| `variant` | `"dark" \| "light"` | `"dark"` | Surface |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding / type |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Position |
| `disabled` | `boolean` | `false` | Suppresses tooltip |
| `className` | `string` | `""` | Wrapper classes |

Accessibility: focusable trigger, `aria-describedby`, `role="tooltip"`.

### Usage

```jsx
import Tooltip from "../components/ui/Tooltip";
import Button from "../components/ui/Button";

<Tooltip content="Create a new record" placement="bottom">
  <Button size="sm" className="w-auto">Add</Button>
</Tooltip>
```

---

## PageHeader

**File:** `src/components/ui/PageHeader.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Page title (`string` or node) |
| `description` | `ReactNode` | — | Supporting text |
| `actions` | `ReactNode` | — | Right-side actions |
| `breadcrumbs` | `ReactNode` | — | Optional breadcrumb nav |
| `variant` | `"default" \| "muted" \| "plain"` | `"default"` | Surface |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding |
| `disabled` | `boolean` | `false` | Non-interactive |
| `className` | `string` | `""` | Extra classes |

### Usage

```jsx
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

<PageHeader
  title="Students"
  description="Manage enrollment and student records."
  actions={
    <Button size="sm" className="w-auto">Add Student</Button>
  }
/>
```

---

## Do / Don't

**Do**

- Compose classes with `cn()` from `utils/cn.js`
- Use token CSS variables for color, radius, type, shadow, z-index
- Keep public props backward compatible when iterating

**Don't**

- Hardcode palette values inside shared primitives when a token exists
- Redesign Sidebar, Dashboard, or feature modules in this kit layer
- Break existing Login / UIShowcase prop contracts

## Revision History

| Date | Batch | Notes |
|------|-------|-------|
| 2026-08-02 | Batch 1 | Stub created with required section headers |
| 2026-08-02 | Batch 2 | Tokenized UI kit; Avatar, Tooltip, PageHeader; Typography Label; API docs |
