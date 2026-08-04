// components/form/fieldStyles.js

import { cn } from "../../utils/cn";

export const fieldLabelClassName = cn(
  "mb-2 block text-[length:var(--font-size-sm)]",
  "font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
);

export const fieldShellClassName = cn(
  "flex w-full rounded-[var(--radius-xl)] border bg-[var(--color-input-bg)]",
  "shadow-[var(--shadow-sm)] transition-[var(--transition-normal)]"
);

export const fieldShellState = ({ error = false, disabled = false } = {}) =>
  cn(
    fieldShellClassName,
    error
      ? "border-[var(--color-danger-500)]"
      : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-4 focus-within:ring-[var(--color-brand-100)]",
    disabled && "bg-[var(--color-input-disabled-bg)] opacity-70"
  );

export const fieldControlClassName = cn(
  "w-full rounded-[var(--radius-xl)] bg-transparent px-[var(--space-4)]",
  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)] outline-none",
  "placeholder:text-[var(--color-input-placeholder)] disabled:cursor-not-allowed"
);

export const fieldErrorClassName = cn(
  "mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]"
);

export const fieldHelperClassName = cn(
  "mt-2 text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]"
);

export const selectControlClassName = cn(
  fieldControlClassName,
  "h-10"
);
