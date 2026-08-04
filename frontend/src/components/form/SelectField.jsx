// components/form/SelectField.jsx

import { useId } from "react";

import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";
import {
  fieldLabelClassName,
  fieldShellState,
  selectControlClassName,
} from "./fieldStyles";

function normalizeOptions(options = []) {
  return options.map((option) =>
    typeof option === "object"
      ? {
          value: option.value,
          label: option.label ?? option.name ?? String(option.value),
          disabled: Boolean(option.disabled),
        }
      : { value: option, label: String(option), disabled: false }
  );
}

/**
 * Generic select field with validation message support.
 */
export default function SelectField({
  label,
  name,
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || name || generatedId;
  const messageId =
    error || helperText ? `${fieldId}-message` : undefined;
  const normalized = normalizeOptions(options);

  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label htmlFor={fieldId} className={fieldLabelClassName}>
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger-500)]" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className={fieldShellState({ error: Boolean(error), disabled })}>
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          aria-required={required || undefined}
          className={selectControlClassName}
          {...props}
        >
          <option value="">{placeholder}</option>
          {normalized.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <FieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
}
