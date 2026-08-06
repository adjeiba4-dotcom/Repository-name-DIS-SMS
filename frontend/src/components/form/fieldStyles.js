// components/form/fieldStyles.js

import { cn } from "../../utils/cn";

export const fieldLabelClassName = cn(
  "ds-field__label mb-0"
);

export const fieldShellClassName = cn(
  "flex w-full rounded-[var(--radius-control)] border bg-[var(--color-input-bg)]",
  "transition-[border-color,box-shadow] duration-[var(--transition-normal)]"
);

export const fieldShellState = ({ error = false, disabled = false } = {}) =>
  cn(
    fieldShellClassName,
    error
      ? "border-[var(--color-danger-500)]"
      : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-ocean-blue-soft)]",
    disabled && "bg-[var(--color-input-disabled-bg)] opacity-70"
  );

export const fieldControlClassName = cn(
  "w-full rounded-[var(--radius-control)] bg-transparent px-[var(--space-4)]",
  "text-[length:var(--font-size-sm)] text-[var(--color-input-text)] outline-none",
  "placeholder:text-[var(--color-input-placeholder)] disabled:cursor-not-allowed"
);

export const fieldErrorClassName = "ds-field__error";

export const fieldHelperClassName = "ds-field__helper";

export const selectControlClassName = cn(
  fieldControlClassName,
  "h-10"
);

export const textareaControlClassName = cn(
  fieldControlClassName,
  "min-h-24 resize-y py-[var(--space-3)]"
);
